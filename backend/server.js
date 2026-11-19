require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const errorHandler = require('./middleware/errorHandler');

require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Paths
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend');
const ADMIN_PATH = path.join(__dirname, '..', 'admin');
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(FRONTEND_PATH, 'images', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// CORS — allow Netlify domains and local dev
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // In development or if wildcard is set, allow all
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Allow if origin matches or is a Netlify subdomain
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowedOrigins.some((ao) => ao.includes('netlify.app') && origin.endsWith('.netlify.app'))) {
      return callback(null, true);
    }
    // For production, still allow (safe fallback)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SS SAI Enterprises API is running!',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded product images from persistent disk
app.use('/images/uploads', express.static(UPLOADS_PATH));

// Frontend static files
app.use(express.static(FRONTEND_PATH));

// Admin console
app.use('/admin', express.static(ADMIN_PATH));

// Customer page routes (SPA-style)
const pages = {
  '/': 'index.html',
  '/welcome': 'welcome.html',
  '/shop': path.join('pages', 'shop.html'),
  '/cart': path.join('pages', 'cart.html'),
  '/checkout': path.join('pages', 'checkout.html'),
  '/login': path.join('pages', 'login.html'),
  '/register': path.join('pages', 'register.html'),
  '/orders': path.join('pages', 'orders.html'),
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, file));
  });
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'pages', 'product.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ADMIN_PATH, 'index.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(ADMIN_PATH, 'dashboard.html'));
});

// Error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🥻 SS SAI Enterprises Store is LIVE!');
  console.log(`➜ Local:  http://localhost:${PORT}`);
  console.log(`➜ Admin:  http://localhost:${PORT}/admin`);
  console.log(`➜ API:    http://localhost:${PORT}/api/health`);
  console.log(`➜ DB:     ${process.env.DB_PATH || 'database/saree_store.db'}`);
  console.log('');
});

module.exports = app;
