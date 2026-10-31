const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/saree_store.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database.');
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  // ─── Create Tables ───────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    fabric TEXT NOT NULL,
    occasion TEXT,
    weave_type TEXT,
    color TEXT,
    length_meters REAL DEFAULT 5.5,
    blouse_piece INTEGER DEFAULT 1,
    zari_type TEXT,
    care_instructions TEXT,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER DEFAULT 10,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    image_url TEXT,
    category_id INTEGER,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_amount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Processing',
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Pending',
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_pincode TEXT,
    coupon_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // ─── Seed Categories ─────────────────────────────────────
  const categories = [
    ['Silk Sarees', 'silk-sarees', 'Luxurious silk sarees including Kanjeevaram, Banarasi and Tussar', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
    ['Cotton Sarees', 'cotton-sarees', 'Breathable and comfortable cotton sarees for everyday wear', 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400'],
    ['Designer Sarees', 'designer-sarees', 'Exclusive designer sarees for special occasions', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400'],
    ['Bridal Sarees', 'bridal-sarees', 'Exquisite bridal collection for the most special day', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400'],
  ];

  const catStmt = db.prepare(`INSERT OR IGNORE INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)`);
  categories.forEach(c => catStmt.run(...c));
  catStmt.finalize();

  // ─── Seed Products ────────────────────────────────────────
  const products = [
    {
      name: 'Royal Kanjeevaram Silk Saree',
      slug: 'royal-kanjeevaram-silk-saree',
      description: 'An exquisite Kanjeevaram silk saree with intricate zari work and a rich peacock motif border. Hand-woven by master artisans in Kanchipuram, this timeless piece is perfect for weddings and grand occasions.',
      fabric: 'Kanjeevaram Silk',
      occasion: 'Bridal',
      weave_type: 'Hand-woven',
      color: 'Deep Red & Gold',
      length_meters: 6.0,
      blouse_piece: 1,
      zari_type: 'Pure Zari',
      care_instructions: 'Dry clean only. Store in muslin cloth.',
      price: 18500,
      original_price: 22000,
      stock: 5,
      rating: 4.9,
      review_count: 87,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
      category_id: 1,
      is_featured: 1
    },
    {
      name: 'Banarasi Brocade Masterpiece',
      slug: 'banarasi-brocade-masterpiece',
      description: 'A magnificent Banarasi brocade saree with opulent gold and silver jangla work. Featuring traditional Mughal-inspired floral patterns woven with the finest silk threads on a luxurious base.',
      fabric: 'Banarasi Silk',
      occasion: 'Festive',
      weave_type: 'Brocade',
      color: 'Royal Blue & Silver',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'Silver Zari',
      care_instructions: 'Dry clean only. Do not wring.',
      price: 14200,
      original_price: 17500,
      stock: 8,
      rating: 4.8,
      review_count: 64,
      image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600',
      category_id: 1,
      is_featured: 1
    },
    {
      name: 'Chanderi Cotton Elegance',
      slug: 'chanderi-cotton-elegance',
      description: 'Delicate Chanderi cotton saree with a fine texture and subtle shimmer. Adorned with delicate bootis and a contrasting silk border, perfect for summer festivals and daytime events.',
      fabric: 'Chanderi Cotton',
      occasion: 'Casual',
      weave_type: 'Handloom',
      color: 'Pastel Pink & Gold',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'Gold Zari Border',
      care_instructions: 'Gentle hand wash in cold water.',
      price: 4800,
      original_price: 6200,
      stock: 15,
      rating: 4.6,
      review_count: 42,
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
      category_id: 2,
      is_featured: 1
    },
    {
      name: 'Organza Floral Fantasy',
      slug: 'organza-floral-fantasy',
      description: 'A dreamy organza saree with hand-painted floral motifs and a sequined border. The sheer, lightweight fabric creates an ethereal silhouette that is perfect for cocktail parties and receptions.',
      fabric: 'Organza',
      occasion: 'Party',
      weave_type: 'Sequin Embellished',
      color: 'Ivory & Rose',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Dry clean only. Handle with care.',
      price: 8900,
      original_price: 11000,
      stock: 7,
      rating: 4.7,
      review_count: 38,
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600',
      category_id: 3,
      is_featured: 1
    },
    {
      name: 'Tussar Silk Heritage Weave',
      slug: 'tussar-silk-heritage-weave',
      description: 'A authentic Tussar silk saree with natural golden sheen and traditional block print motifs. Sustainably sourced wild silk with earthy tribal patterns that celebrate India\'s indigenous craft heritage.',
      fabric: 'Tussar Silk',
      occasion: 'Festive',
      weave_type: 'Block Print',
      color: 'Earth Tones & Rust',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Dry clean recommended. Store in dry place.',
      price: 6500,
      original_price: 8000,
      stock: 12,
      rating: 4.5,
      review_count: 29,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&sat=-30',
      category_id: 1,
      is_featured: 0
    },
    {
      name: 'Linen Handloom Comfort',
      slug: 'linen-handloom-comfort',
      description: 'A premium linen handloom saree with a natural texture and elegant minimalist design. Features a contrasting border with geometric patterns, ideal for corporate settings and casual celebrations.',
      fabric: 'Linen',
      occasion: 'Casual',
      weave_type: 'Handloom',
      color: 'Off-White & Navy',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Machine wash cold, gentle cycle.',
      price: 3200,
      original_price: 4000,
      stock: 20,
      rating: 4.4,
      review_count: 56,
      image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&hue=180',
      category_id: 2,
      is_featured: 0
    },
    {
      name: 'Bridal Red Kanjeevaram',
      slug: 'bridal-red-kanjeevaram',
      description: 'The quintessential bridal Kanjeevaram in auspicious deep red with solid gold zari borders and pallu. Passed down as heirloom quality, this saree embodies centuries of weaving tradition.',
      fabric: 'Kanjeevaram Silk',
      occasion: 'Bridal',
      weave_type: 'Temple Border',
      color: 'Crimson Red & Gold',
      length_meters: 6.2,
      blouse_piece: 1,
      zari_type: 'Pure Gold Zari',
      care_instructions: 'Dry clean only. Air occasionally.',
      price: 28000,
      original_price: 35000,
      stock: 3,
      rating: 5.0,
      review_count: 112,
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&sat=50',
      category_id: 4,
      is_featured: 1
    },
    {
      name: 'Georgette Embroidered Grace',
      slug: 'georgette-embroidered-grace',
      description: 'A flowing georgette saree with intricate thread and sequin embroidery across the pallu and border. Light and flowy, this saree drapes beautifully and is perfect for evening events.',
      fabric: 'Georgette',
      occasion: 'Party',
      weave_type: 'Embroidered',
      color: 'Emerald Green & Gold',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'Thread Work',
      care_instructions: 'Dry clean only.',
      price: 7200,
      original_price: 9000,
      stock: 9,
      rating: 4.6,
      review_count: 33,
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&hue=120',
      category_id: 3,
      is_featured: 0
    },
    {
      name: 'Pochampally Ikat Silk',
      slug: 'pochampally-ikat-silk',
      description: 'A stunning Pochampally Ikat saree featuring the iconic geometric ikat patterns created by the ancient resist-dyeing technique. GI-tagged authentic product from the weavers of Telangana.',
      fabric: 'Ikat Silk',
      occasion: 'Festive',
      weave_type: 'Double Ikat',
      color: 'Maroon & Teal',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Dry clean only first few washes.',
      price: 9800,
      original_price: 12500,
      stock: 6,
      rating: 4.8,
      review_count: 47,
      image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&sat=40',
      category_id: 1,
      is_featured: 1
    },
    {
      name: 'Soft Silk Mysore Elegance',
      slug: 'soft-silk-mysore-elegance',
      description: 'A classic Mysore Crepe Silk saree known for its smooth texture and natural lustre. Features plain body with contrasting zari border and richly woven pallu – perfect for any grand occasion.',
      fabric: 'Mysore Silk',
      occasion: 'Festive',
      weave_type: 'Plain Weave',
      color: 'Purple & Gold',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'Gold Border Zari',
      care_instructions: 'Dry clean only.',
      price: 11500,
      original_price: 14000,
      stock: 11,
      rating: 4.7,
      review_count: 61,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&hue=270',
      category_id: 1,
      is_featured: 0
    },
    {
      name: 'Bengal Tant Cotton Weave',
      slug: 'bengal-tant-cotton-weave',
      description: 'An authentic Bengali Tant cotton saree with fine muslin-like texture and traditional red & white color combination with large red border. Lightweight and perfect for daily wear.',
      fabric: 'Bengal Cotton',
      occasion: 'Casual',
      weave_type: 'Tant Weave',
      color: 'White & Red',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Hand wash separately. Do not bleach.',
      price: 2400,
      original_price: 3000,
      stock: 25,
      rating: 4.3,
      review_count: 78,
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&sat=-50',
      category_id: 2,
      is_featured: 0
    },
    {
      name: 'Designer Leheriya Ombre',
      slug: 'designer-leheriya-ombre',
      description: 'A contemporary designer saree featuring the traditional Rajasthani Leheriya (wave) tie-dye technique in a stunning ombre gradient. A fusion of heritage craftsmanship and modern aesthetics.',
      fabric: 'Georgette',
      occasion: 'Party',
      weave_type: 'Tie-dye',
      color: 'Saffron to Deep Orange Ombre',
      length_meters: 5.5,
      blouse_piece: 1,
      zari_type: 'None',
      care_instructions: 'Dry clean only. Colors may bleed initially.',
      price: 5600,
      original_price: 7000,
      stock: 14,
      rating: 4.5,
      review_count: 25,
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&hue=30',
      category_id: 3,
      is_featured: 0
    },
  ];

  const prodStmt = db.prepare(`
    INSERT OR IGNORE INTO products 
    (name, slug, description, fabric, occasion, weave_type, color, length_meters, blouse_piece, zari_type, care_instructions, price, original_price, stock, rating, review_count, image_url, category_id, is_featured) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  products.forEach(p => {
    prodStmt.run(
      p.name, p.slug, p.description, p.fabric, p.occasion, p.weave_type, p.color,
      p.length_meters, p.blouse_piece, p.zari_type, p.care_instructions,
      p.price, p.original_price, p.stock, p.rating, p.review_count,
      p.image_url, p.category_id, p.is_featured
    );
  });
  prodStmt.finalize();
});

module.exports = db;
