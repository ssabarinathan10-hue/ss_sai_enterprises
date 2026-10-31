const db = require('../config/db');

// GET /api/cart
const getCart = (req, res) => {
  db.all(
    `SELECT ci.id, ci.quantity, ci.added_at, p.id as product_id, p.name, p.price, p.original_price, p.image_url, p.fabric, p.stock
     FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
    [req.user.id],
    (err, items) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      res.json({ success: true, items, total });
    }
  );
};

// POST /api/cart
const addToCart = (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: 'Product ID is required.' });

  db.get(`SELECT * FROM products WHERE id = ?`, [product_id], (err, product) => {
    if (err || !product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const qty = Math.max(1, Number(quantity) || 1);
    if (qty < 1 || !Number.isFinite(qty)) return res.status(400).json({ success: false, message: 'Enter a valid quantity.' });
    if (product.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock.' });

    db.run(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + ?`,
      [req.user.id, product_id, qty, qty],
      function (err2) {
        if (err2) return res.status(500).json({ success: false, message: 'Failed to add to cart.' });
        res.status(201).json({ success: true, message: 'Item added to cart.' });
      }
    );
  });
};

// PUT /api/cart/:id
const updateCartItem = (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  const qty = Number(quantity);
  if (!qty || qty < 1) return res.status(400).json({ success: false, message: 'Valid quantity is required.' });

  db.get(
    `SELECT ci.id, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?`,
    [id, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update cart item.' });
      if (!row) return res.status(404).json({ success: false, message: 'Cart item not found.' });
      if (qty > row.stock) return res.status(400).json({ success: false, message: 'Insufficient stock.' });

  db.run(
    `UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?`,
    [qty, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update cart item.' });
      if (this.changes === 0) return res.status(404).json({ success: false, message: 'Cart item not found.' });
      res.json({ success: true, message: 'Cart updated.' });
    }
  );
    }
  );
};

// DELETE /api/cart/:id
const removeCartItem = (req, res) => {
  db.run(
    `DELETE FROM cart_items WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to remove item.' });
      res.json({ success: true, message: 'Item removed from cart.' });
    }
  );
};

// DELETE /api/cart
const clearCart = (req, res) => {
  db.run(`DELETE FROM cart_items WHERE user_id = ?`, [req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
    res.json({ success: true, message: 'Cart cleared.' });
  });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
