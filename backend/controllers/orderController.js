const db = require('../config/db');

const COUPONS = {
  ROYAL10: 10,
  BRIDAL20: 20,
  FIRST15: 15,
};

// POST /api/orders
const createOrder = (req, res) => {
  const { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method = 'COD', coupon_code } = req.body;

  if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
    return res.status(400).json({ success: false, message: 'All shipping details are required.' });
  }

  db.all(
    `SELECT ci.quantity, p.id as product_id, p.price, p.stock, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
    [req.user.id],
    (err, cartItems) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
      if (!cartItems || cartItems.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty.' });

      const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shipping_amount = subtotal >= 3000 ? 0 : 150;
      const tax_amount = Math.round(subtotal * 0.05); // 5% GST

      let discount_amount = 0;
      if (coupon_code && COUPONS[coupon_code.toUpperCase()]) {
        discount_amount = Math.round(subtotal * COUPONS[coupon_code.toUpperCase()] / 100);
      }

      const total_amount = subtotal + shipping_amount + tax_amount - discount_amount;

      db.run(
        `INSERT INTO orders (user_id, total_amount, discount_amount, shipping_amount, tax_amount, payment_method, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, coupon_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, total_amount, discount_amount, shipping_amount, tax_amount, payment_method, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, coupon_code || null],
        function (err2) {
          if (err2) return res.status(500).json({ success: false, message: 'Failed to create order.' });

          const orderId = this.lastID;
          const itemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
          cartItems.forEach(item => itemStmt.run(orderId, item.product_id, item.quantity, item.price));
          itemStmt.finalize();

          // Update stock
          cartItems.forEach(item => {
            db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.quantity, item.product_id]);
          });

          // Clear cart
          db.run(`DELETE FROM cart_items WHERE user_id = ?`, [req.user.id]);

          res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order_id: orderId,
            total_amount,
            subtotal,
            shipping_amount,
            tax_amount,
            discount_amount,
            payment_method,
            items: cartItems.map(i => ({
              product_id: i.product_id,
              name: i.name,
              quantity: i.quantity,
              price: i.price
            })),
            shipping_details: {
              name: shipping_name,
              phone: shipping_phone,
              address: shipping_address,
              city: shipping_city,
              state: shipping_state,
              pincode: shipping_pincode
            }
          });
        }
      );
    }
  );
};

// GET /api/orders
const getOrders = (req, res) => {
  const isAdmin = req.user && (req.user.role === 'admin' || req.user.id === 0);
  const sql = isAdmin 
    ? `SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items_summary
       FROM orders o 
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id ORDER BY o.created_at DESC`
    : `SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items_summary
       FROM orders o 
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`;
  const params = isAdmin ? [] : [req.user.id];

  db.all(sql, params, (err, orders) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    res.json({ success: true, orders: orders || [] });
  });
};

// GET /api/orders/:id
const getOrderById = (req, res) => {
  db.get(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, order) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    db.all(
      `SELECT oi.*, p.name, p.image_url, p.fabric FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [order.id],
      (err2, items) => {
        if (err2) items = [];
        res.json({ success: true, order: { ...order, items } });
      }
    );
  });
};

// POST /api/orders/validate-coupon
const validateCoupon = (req, res) => {
  const { coupon_code } = req.body;
  if (!coupon_code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

  const discount = COUPONS[coupon_code.toUpperCase()];
  if (!discount) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });

  res.json({ success: true, message: `Coupon applied! You get ${discount}% off.`, discount_percent: discount });
};

// PUT /api/orders/:id/status (Admin)
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;

  if (!status && !payment_status) {
    return res.status(400).json({ success: false, message: 'Status or payment status is required.' });
  }

  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status); }
  params.push(id);

  db.run(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Failed to update order.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Order updated successfully!' });
  });
};

module.exports = { createOrder, getOrders, getOrderById, validateCoupon, updateOrderStatus };

