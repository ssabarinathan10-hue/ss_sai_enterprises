# 🥻 Vasanthi Silks – Online Saree Business

A full-stack premium e-commerce platform for an Indian saree business, featuring a Node.js + Express REST API backend, SQLite database with 12+ pre-seeded products, and a stunning royal Indian luxury themed frontend.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Installation & Run

```bash
# 1. Navigate to the project root
cd online-saree-business

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Then open your browser at **http://localhost:5000** 🎉

---

## 📁 Project Structure

```
online-saree-business/
│
├── frontend/                    # Static HTML/CSS/JS frontend
│   ├── index.html               # Homepage – Hero, Categories, Featured Sarees
│   ├── pages/
│   │   ├── shop.html            # Product catalog with filters & search
│   │   ├── product.html         # Product detail – gallery, specs, reviews
│   │   ├── cart.html            # Shopping cart with coupon codes
│   │   ├── checkout.html        # Checkout – shipping, delivery, payment
│   │   ├── login.html           # Customer login
│   │   ├── register.html        # Customer registration
│   │   └── orders.html          # Order history & tracking
│   │
│   ├── css/
│   │   ├── style.css            # Core design system (palette, typography, utilities)
│   │   ├── components.css       # Navbar, cards, hero, footer, modals
│   │   └── pages.css            # Page-specific layouts
│   │
│   ├── js/
│   │   ├── api.js               # Centralized API client
│   │   ├── auth.js              # Auth state management (JWT)
│   │   ├── cart.js              # Cart manager (auth + guest modes)
│   │   └── main.js              # Global utilities: toast, stars, navbar, etc.
│   │
│   └── assets/
│       ├── images/              # Product & banner images
│       └── icons/               # SVG icons
│
├── backend/
│   ├── server.js                # Express entrypoint (API + static serve)
│   ├── config/
│   │   └── db.js                # SQLite setup, schema creation & seed data
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorHandler.js     # Centralized error handler
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, Profile
│   │   ├── productController.js # Catalog, filters, detail, reviews
│   │   ├── cartController.js    # Add, update, remove, clear cart
│   │   └── orderController.js  # Create order, history, coupon validation
│   └── routes/
│       ├── auth.js              # /api/auth/*
│       ├── products.js          # /api/products/*
│       ├── cart.js              # /api/cart/*
│       └── orders.js            # /api/orders/*
│
├── database/
│   ├── schema.sql               # SQL schema reference
│   └── saree_store.db           # Auto-generated SQLite database
│
└── package.json
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--crimson` | `#7A1326` | Primary buttons, highlights |
| `--maroon` | `#4A0E17` | Headings, navbar logo |
| `--gold` | `#D4AF37` | Accents, borders, badges |
| `--champagne` | `#FBF6EE` | Page backgrounds |
| `--charcoal` | `#1E1E24` | Body text, dark elements |

**Fonts:** Playfair Display (headings) · Cormorant Garamond (subheadings) · Inter (body)

---

## 🛠 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 🔐 Auth Routes `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new customer |
| POST | `/login` | ❌ | Login and receive JWT token |
| GET | `/profile` | ✅ | Get current user profile |
| PUT | `/profile` | ✅ | Update user profile |

**Register Request:**
```json
{
  "name": "Priya Venkataraman",
  "email": "priya@example.com",
  "password": "securepassword",
  "phone": "9876543210"
}
```

**Login Request:**
```json
{
  "email": "priya@example.com",
  "password": "securepassword"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Priya Venkataraman", "email": "priya@example.com" }
}
```

---

### 🥻 Product Routes `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List products with filters |
| GET | `/categories` | ❌ | List all categories |
| GET | `/:id` | ❌ | Get product by ID or slug |
| POST | `/:id/reviews` | ✅ | Submit a product review |

**Query Parameters for GET `/api/products`:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `fabric` | string | `Kanjeevaram Silk` | Filter by fabric type |
| `occasion` | string | `Bridal` | Filter by occasion |
| `category` | string | `silk-sarees` | Filter by category slug |
| `min_price` | number | `5000` | Minimum price filter |
| `max_price` | number | `20000` | Maximum price filter |
| `search` | string | `red kanjeevaram` | Full-text search |
| `sort` | string | `price_asc` | Sort order: `price_asc`, `price_desc`, `rating`, `newest` |
| `featured` | boolean | `true` | Only featured products |
| `page` | number | `1` | Page number |
| `limit` | number | `12` | Items per page |

---

### 🛒 Cart Routes `/api/cart` *(Protected)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current user's cart |
| POST | `/` | Add item to cart |
| PUT | `/:id` | Update item quantity |
| DELETE | `/clear` | Clear entire cart |
| DELETE | `/:id` | Remove single item |

**Add to Cart:**
```json
{ "product_id": 3, "quantity": 1 }
```

---

### 📦 Order Routes `/api/orders` *(Protected)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's order history |
| POST | `/` | Place a new order |
| GET | `/:id` | Get order by ID |
| POST | `/validate-coupon` | Validate a coupon code |

**Place Order:**
```json
{
  "shipping_name": "Priya Venkataraman",
  "shipping_phone": "9876543210",
  "shipping_address": "42, Silk Street, Mylapore",
  "shipping_city": "Chennai",
  "shipping_state": "Tamil Nadu",
  "shipping_pincode": "600004",
  "payment_method": "UPI",
  "coupon_code": "ROYAL10"
}
```

---

## 🎟 Coupon Codes

| Code | Discount | Description |
|------|----------|-------------|
| `ROYAL10` | 10% off | All orders |
| `BRIDAL20` | 20% off | Bridal collection orders |
| `FIRST15` | 15% off | First-time purchase |

---

## 🗄 Database Schema

**Tables:**
- `users` – Customer accounts
- `categories` – Product categories (Silk, Cotton, Designer, Bridal)
- `products` – Product catalog with full specs
- `product_images` – Multiple images per product
- `cart_items` – Active shopping carts
- `orders` – Order records with shipping & payment info
- `order_items` – Individual items per order
- `reviews` – Product reviews & ratings

---

## 🌟 Features

- ✅ JWT Authentication (Register / Login / Profile)
- ✅ Product catalog with 12+ pre-seeded Indian sarees
- ✅ Advanced filtering (Fabric, Occasion, Price range, Sort)
- ✅ Full-text search across name, fabric, color, description
- ✅ Persistent shopping cart (per-user)
- ✅ Coupon code discounts
- ✅ GST (5%) and shipping calculation (Free over ₹3,000)
- ✅ Multiple delivery options (Standard / Express / Next-Day)
- ✅ Multiple payment methods (COD / UPI / Card / Net Banking)
- ✅ Order tracking with status timeline
- ✅ Product reviews and ratings system
- ✅ Fully responsive design (desktop + mobile)

---

## 🔧 Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=5000
JWT_SECRET=your_custom_secret_key_here
NODE_ENV=development
```

---

## 📸 Screenshots

The platform features:
- **Homepage:** Luxury hero banner, animated marquee strip, 4-column category grid, featured products
- **Shop:** Filter sidebar, search bar, responsive product grid
- **Product:** Gallery with thumbnail switching, specs table, reviews tab
- **Cart:** Table layout with quantity controls, coupon codes, order summary
- **Checkout:** Multi-step form with delivery & payment options
- **Orders:** Timeline-based order tracking with detail modal

---

*Crafted with ❤️ · Vasanthi Silks – Since 1987*
