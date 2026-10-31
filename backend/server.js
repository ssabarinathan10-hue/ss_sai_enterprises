require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow all if no restricted CORS_ORIGIN is specified
    if (!allowedOrigins || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow Netlify subdomains if configured with a Netlify wildcard/domain
    if (allowedOrigins.some((ao) => ao.includes('netlify.app') && origin.endsWith('.netlify.app'))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Saree Store API is running!',
        version: '1.0.0'
    });
});

// Frontend
app.use(express.static(FRONTEND_PATH));

// ADMIN
app.use('/admin', express.static(ADMIN_PATH));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(ADMIN_PATH, 'index.html'));
});

// Customer pages
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'shop.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'checkout.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'register.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'pages', 'orders.html'));
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log('');
    console.log('🥻 Online Saree Store is LIVE!');
    console.log(`➜ Local: http://localhost:${PORT}`);
    console.log(`➜ Admin: http://localhost:${PORT}/admin`);
    console.log(`➜ API:   http://localhost:${PORT}/api/health`);
    console.log('');
});

module.exports = app;