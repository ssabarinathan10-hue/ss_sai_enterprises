const db = require('../config/db');
const fs = require('fs');
const path = require('path');

function applyProductFilters(req) {
  const { fabric, occasion, category, min_price, max_price, search, featured } = req.query;
  let where = ` WHERE 1=1`;
  const params = [];

  if (fabric) { where += ` AND p.fabric LIKE ?`; params.push(`%${fabric}%`); }
  if (occasion) { where += ` AND p.occasion = ?`; params.push(occasion); }
  if (category) { where += ` AND c.slug = ?`; params.push(category); }
  if (min_price) { where += ` AND p.price >= ?`; params.push(Number(min_price)); }
  if (max_price) { where += ` AND p.price <= ?`; params.push(Number(max_price)); }
  if (featured === 'true') { where += ` AND p.is_featured = 1`; }
  if (search) {
    where += ` AND (p.name LIKE ? OR p.fabric LIKE ? OR p.color LIKE ? OR p.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  return { where, params };
}

function resolveCategoryId(category_id, category_name, cb) {
  if (category_id) return cb(null, Number(category_id));
  if (!category_name) return cb(null, 1);
  db.get(`SELECT id FROM categories WHERE name LIKE ? OR slug LIKE ? LIMIT 1`, [`%${category_name}%`, `%${String(category_name).toLowerCase()}%`], (err, cat) => {
    cb(err, cat ? cat.id : 1);
  });
}

// GET /api/products
const getProducts = (req, res) => {
  const { sort, limit = 12, page = 1 } = req.query;
  const { where, params } = applyProductFilters(req);
  const from = ` FROM products p LEFT JOIN categories c ON p.category_id = c.id`;

  let order = ` ORDER BY p.is_featured DESC, p.rating DESC`;
  if (sort === 'price_asc') order = ` ORDER BY p.price ASC`;
  else if (sort === 'price_desc') order = ` ORDER BY p.price DESC`;
  else if (sort === 'rating') order = ` ORDER BY p.rating DESC`;
  else if (sort === 'newest') order = ` ORDER BY p.created_at DESC`;

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 12));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  db.get(`SELECT COUNT(*) as total ${from}${where}`, params, (countErr, countRow) => {
    if (countErr) return res.status(500).json({ success: false, message: 'Failed to fetch products.' });

    const query = `SELECT p.*, c.name as category_name, c.slug as category_slug ${from}${where}${order} LIMIT ? OFFSET ?`;
    db.all(query, [...params, safeLimit, offset], (err, products) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
      res.json({
        success: true,
        products,
        total: countRow ? countRow.total : 0,
        page: safePage,
        limit: safeLimit
      });
    });
  });
};

// GET /api/products/:id
const getProductById = (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? OR p.slug = ?`,
    [id, id],
    (err, product) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to fetch product.' });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

      // Get reviews
      db.all(
        `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10`,
        [product.id],
        (err2, reviews) => {
          if (err2) reviews = [];
          db.all(
            `SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC`,
            [product.id],
            (err3, images) => {
              const extra = (!err3 && images) ? images.map(i => i.image_url).filter(Boolean) : [];
              const gallery = [product.image_url, ...extra].filter(Boolean);
              const unique = [...new Set(gallery)];
              res.json({ success: true, product: { ...product, reviews: reviews || [], images: unique } });
            }
          );
        }
      );
    }
  );
};

// GET /api/products/categories
const getCategories = (req, res) => {
  db.all(`SELECT * FROM categories`, [], (err, categories) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    res.json({ success: true, categories });
  });
};

// POST /api/products/:id/reviews
const addReview = (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params;
  if (!rating) return res.status(400).json({ success: false, message: 'Rating is required.' });

  db.run(
    `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
    [id, req.user.id, rating, comment || null],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Failed to add review.' });
      // Update product rating
      db.run(
        `UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?), review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?) WHERE id = ?`,
        [id, id, id]
      );
      res.status(201).json({ success: true, message: 'Review added successfully.' });
    }
  );
};

// POST /api/products (Admin or product creation)
const createProduct = (req, res) => {
  const {
    name, description, fabric = 'Silk', occasion = 'Festive', weave_type = 'Handloom',
    color = '', length_meters = 5.5, blouse_piece = 1, zari_type = 'Zari',
    care_instructions = 'Dry clean only', price, original_price = 0,
    stock = 10, category_name = 'Silk', is_featured = 0, image_url = ''
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Product name and price are required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  const numericPrice = Number(price);
  const numericOriginal = Number(original_price || price);
  const numericStock = Number(stock);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Enter a valid price greater than 0.' });
  }
  if (!Number.isFinite(numericStock) || numericStock < 0) {
    return res.status(400).json({ success: false, message: 'Enter a valid stock quantity.' });
  }

  resolveCategoryId(req.body.category_id, category_name, (err, category_id) => {
    db.run(
      `INSERT INTO products 
       (name, slug, description, fabric, occasion, weave_type, color, length_meters, blouse_piece, zari_type, care_instructions, price, original_price, stock, rating, review_count, image_url, category_id, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [name, slug, description || '', fabric, occasion, weave_type, color, length_meters, blouse_piece, zari_type, care_instructions, numericPrice, numericOriginal, numericStock, image_url, category_id, is_featured ? 1 : 0],
      function (err2) {
        if (err2) return res.status(500).json({ success: false, message: 'Failed to create product: ' + err2.message });
        res.status(201).json({
          success: true,
          message: 'Product created successfully!',
          product: { id: this.lastID, name, price: numericPrice, stock: numericStock, category_id }
        });
      }
    );
  });
};

const updateProduct = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to update product.' });
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    const name = req.body.name || existing.name;
    const description = req.body.description != null ? req.body.description : existing.description;
    const fabric = req.body.fabric || existing.fabric;
    const occasion = req.body.occasion || existing.occasion;
    const weave_type = req.body.weave_type || existing.weave_type;
    const color = req.body.color != null ? req.body.color : existing.color;
    const length_meters = req.body.length_meters != null ? Number(req.body.length_meters) : existing.length_meters;
    const blouse_piece = req.body.blouse_piece != null ? (req.body.blouse_piece ? 1 : 0) : existing.blouse_piece;
    const zari_type = req.body.zari_type != null ? req.body.zari_type : existing.zari_type;
    const care_instructions = req.body.care_instructions != null ? req.body.care_instructions : existing.care_instructions;
    const price = req.body.price != null ? Number(req.body.price) : existing.price;
    const original_price = req.body.original_price != null ? Number(req.body.original_price) : existing.original_price;
    const stock = req.body.stock != null ? Number(req.body.stock) : existing.stock;
    const image_url = req.body.image_url != null ? req.body.image_url : existing.image_url;
    const is_featured = req.body.is_featured != null ? (req.body.is_featured ? 1 : 0) : existing.is_featured;

    if (!name || !Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'A valid name and price are required.' });
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid stock quantity.' });
    }

    resolveCategoryId(req.body.category_id, req.body.category_name, (catErr, category_id) => {
      const nextCategory = category_id || existing.category_id;
      db.run(
        `UPDATE products SET name=?, description=?, fabric=?, occasion=?, weave_type=?, color=?, length_meters=?, blouse_piece=?, zari_type=?, care_instructions=?, price=?, original_price=?, stock=?, image_url=?, category_id=?, is_featured=? WHERE id=?`,
        [name, description, fabric, occasion, weave_type, color, length_meters, blouse_piece, zari_type, care_instructions, price, original_price, stock, image_url, nextCategory, is_featured, id],
        function (err2) {
          if (err2) return res.status(500).json({ success: false, message: 'Failed to update product.' });
          res.json({ success: true, message: 'Product updated successfully.' });
        }
      );
    });
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT id FROM products WHERE id = ?`, [id], (err, product) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to delete product.' });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    db.run(`DELETE FROM product_images WHERE product_id = ?`, [id], () => {
      db.run(`DELETE FROM reviews WHERE product_id = ?`, [id], () => {
        db.run(`DELETE FROM cart_items WHERE product_id = ?`, [id], () => {
          db.run(`DELETE FROM products WHERE id = ?`, [id], function (err2) {
            if (err2) return res.status(500).json({ success: false, message: 'Cannot delete this product because it is linked to existing orders.' });
            res.json({ success: true, message: 'Product deleted successfully.' });
          });
        });
      });
    });
  });
};

const uploadProductImage = (req, res) => {
  const { image, filename } = req.body || {};
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ success: false, message: 'A valid image file is required.' });
  }

  const match = image.match(/^data:(image\/(png|jpe?g|webp|gif));base64,(.+)$/i);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Unsupported image format. Use JPG, PNG, WEBP, or GIF.' });
  }

  const ext = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
  const buffer = Buffer.from(match[3], 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Image must be smaller than 5MB.' });
  }

  const dir = path.join(__dirname, '../../frontend/images/uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const safeName = String(filename || 'saree').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
  const stored = `${safeName || 'saree'}-${Date.now()}.${ext}`;
  fs.writeFile(path.join(dir, stored), buffer, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to save image.' });
    res.json({ success: true, image_url: `/images/uploads/${stored}` });
  });
};

module.exports = { getProducts, getProductById, getCategories, addReview, createProduct, updateProduct, deleteProduct, uploadProductImage };

