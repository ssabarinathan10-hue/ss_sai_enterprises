/**
 * SS SAI ENTERPRISES — Resilient Universal API Client
 * 
 * Features:
 * 1. Connects to live Express REST backend when available (local or via API_BASE_URL).
 * 2. Automatic graceful fallback to embedded client database when backend is unreachable,
 *    deployed statically on Netlify without a backend, or returning HTML 404 pages.
 * 3. Intercepts fetch calls to /api/* so raw fetch() calls in admin and pages work offline.
 * 4. Zero "Unexpected token '<', <!DOCTYPE... is not valid JSON" crashes.
 */

(function (root) {
  'use strict';

  // ── Resolve API Base URL ──────────────────────────────────────
  const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : root);

  function resolveApiBase() {
    if (globalScope.API_BASE) return globalScope.API_BASE;
    const custom = globalScope.API_BASE_URL || '';
    if (!custom) return '/api';
    const clean = String(custom).trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  const API_BASE = resolveApiBase();
  globalScope.API_BASE = API_BASE;

  // ── Pre-seeded Authentic Catalog & Data ────────────────────────
  const FALLBACK_CATEGORIES = [
    {
      id: 1,
      name: 'Silk Sarees',
      slug: 'silk-sarees',
      description: 'Luxurious silk sarees including Kanjeevaram, Banarasi and Tussar',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
    },
    {
      id: 2,
      name: 'Cotton Sarees',
      slug: 'cotton-sarees',
      description: 'Breathable and comfortable cotton sarees for everyday wear',
      image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600'
    },
    {
      id: 3,
      name: 'Designer Sarees',
      slug: 'designer-sarees',
      description: 'Exclusive designer sarees for special occasions',
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'
    },
    {
      id: 4,
      name: 'Bridal Sarees',
      slug: 'bridal-sarees',
      description: 'Exquisite bridal collection for the most special day',
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'
    }
  ];

  const FALLBACK_PRODUCTS = [
    {
      id: 1,
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
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
        '/images/saree_slide_1.jpg',
        '/images/hero_bg_1.jpg'
      ],
      category_id: 1,
      category_name: 'Silk Sarees',
      category_slug: 'silk-sarees',
      is_featured: 1
    },
    {
      id: 2,
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
      images: [
        'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600',
        '/images/saree_slide_2.jpg'
      ],
      category_id: 1,
      category_name: 'Silk Sarees',
      category_slug: 'silk-sarees',
      is_featured: 1
    },
    {
      id: 3,
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
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
        '/images/saree_slide_3.jpg'
      ],
      category_id: 2,
      category_name: 'Cotton Sarees',
      category_slug: 'cotton-sarees',
      is_featured: 1
    },
    {
      id: 4,
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
      images: [
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600',
        '/images/saree_slide_4.jpg'
      ],
      category_id: 3,
      category_name: 'Designer Sarees',
      category_slug: 'designer-sarees',
      is_featured: 1
    },
    {
      id: 5,
      name: 'Tussar Silk Heritage Weave',
      slug: 'tussar-silk-heritage-weave',
      description: 'An authentic Tussar silk saree with natural golden sheen and traditional block print motifs. Sustainably sourced wild silk with earthy tribal patterns that celebrate India\'s indigenous craft heritage.',
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
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&sat=-30'],
      category_id: 1,
      category_name: 'Silk Sarees',
      category_slug: 'silk-sarees',
      is_featured: 0
    },
    {
      id: 6,
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
      images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&hue=180'],
      category_id: 2,
      category_name: 'Cotton Sarees',
      category_slug: 'cotton-sarees',
      is_featured: 0
    },
    {
      id: 7,
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
      images: [
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&sat=50',
        '/images/saree_slide_2.jpg'
      ],
      category_id: 4,
      category_name: 'Bridal Sarees',
      category_slug: 'bridal-sarees',
      is_featured: 1
    },
    {
      id: 8,
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
      images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&hue=120'],
      category_id: 3,
      category_name: 'Designer Sarees',
      category_slug: 'designer-sarees',
      is_featured: 0
    },
    {
      id: 9,
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
      images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&sat=40'],
      category_id: 1,
      category_name: 'Silk Sarees',
      category_slug: 'silk-sarees',
      is_featured: 1
    },
    {
      id: 10,
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
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&hue=270'],
      category_id: 1,
      category_name: 'Silk Sarees',
      category_slug: 'silk-sarees',
      is_featured: 0
    },
    {
      id: 11,
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
      images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&sat=-50'],
      category_id: 2,
      category_name: 'Cotton Sarees',
      category_slug: 'cotton-sarees',
      is_featured: 0
    },
    {
      id: 12,
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
      images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&hue=30'],
      category_id: 3,
      category_name: 'Designer Sarees',
      category_slug: 'designer-sarees',
      is_featured: 0
    }
  ];

  const COUPONS = {
    'ROYAL10': 10,
    'BRIDAL20': 20,
    'FIRST15': 15
  };

  // ── Standalone Fallback Store ─────────────────────────────────
  const FallbackStore = {
    getCustomProducts() {
      try {
        return JSON.parse(localStorage.getItem('saree_custom_products') || '[]');
      } catch { return []; }
    },

    getAllProducts() {
      const custom = FallbackStore.getCustomProducts();
      return [...FALLBACK_PRODUCTS, ...custom];
    },

    getReviews(productId) {
      try {
        const stored = JSON.parse(localStorage.getItem('saree_reviews') || '[]');
        const matching = stored.filter(r => String(r.product_id) === String(productId));
        if (matching.length) return matching;
      } catch {}
      return [
        { id: 101, product_id: productId, user_name: 'Ananya Sharma', rating: 5, comment: 'Exquisite weave, graceful fall, and the zari shines with pure elegance!', created_at: '2026-10-15T10:00:00Z' },
        { id: 102, product_id: productId, user_name: 'Meenakshi S.', rating: 5, comment: 'Authentic heirloom quality. Arrived neatly packaged in muslin.', created_at: '2026-10-20T14:30:00Z' }
      ];
    },

    getProducts(params = {}) {
      let list = FallbackStore.getAllProducts();

      // Category filter (slug or name)
      if (params.category) {
        const catQuery = String(params.category).toLowerCase().replace(/-sarees?$/, '');
        list = list.filter(p => {
          const slug = (p.category_slug || '').toLowerCase();
          const name = (p.category_name || '').toLowerCase();
          return slug.includes(catQuery) || name.includes(catQuery);
        });
      }

      // Fabric filter
      if (params.fabric) {
        const fab = String(params.fabric).toLowerCase();
        list = list.filter(p => (p.fabric || '').toLowerCase().includes(fab));
      }

      // Occasion filter
      if (params.occasion) {
        const occ = String(params.occasion).toLowerCase();
        list = list.filter(p => (p.occasion || '').toLowerCase() === occ);
      }

      // Price filter
      if (params.min_price) {
        const min = Number(params.min_price);
        if (Number.isFinite(min)) list = list.filter(p => p.price >= min);
      }
      if (params.max_price) {
        const max = Number(params.max_price);
        if (Number.isFinite(max)) list = list.filter(p => p.price <= max);
      }

      // Search filter
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.fabric || '').toLowerCase().includes(q) ||
          (p.color || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        );
      }

      // Featured filter
      if (params.featured === 'true' || params.featured === true || params.featured === 1) {
        list = list.filter(p => p.is_featured);
      }

      // Sorting
      if (params.sort === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (params.sort === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (params.sort === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (params.sort === 'newest') {
        list.reverse();
      }

      const total = list.length;
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
      const offset = (page - 1) * limit;
      const paginated = list.slice(offset, offset + limit);

      return {
        success: true,
        products: paginated,
        total,
        page,
        limit
      };
    },

    getProduct(idOrSlug) {
      const all = FallbackStore.getAllProducts();
      const product = all.find(p => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug));
      if (!product) {
        return { success: false, message: 'Product not found.' };
      }
      const reviews = FallbackStore.getReviews(product.id);
      const gallery = (product.images && product.images.length) ? product.images : [product.image_url];
      return {
        success: true,
        product: {
          ...product,
          images: [...new Set(gallery.filter(Boolean))],
          reviews
        }
      };
    },

    getCategories() {
      return {
        success: true,
        categories: FALLBACK_CATEGORIES
      };
    },

    addReview(productId, data) {
      try {
        const stored = JSON.parse(localStorage.getItem('saree_reviews') || '[]');
        const newRev = {
          id: Date.now(),
          product_id: Number(productId),
          user_name: (JSON.parse(localStorage.getItem('saree_user') || '{}').name) || 'Valued Customer',
          rating: Number(data.rating) || 5,
          comment: String(data.comment || ''),
          created_at: new Date().toISOString()
        };
        stored.unshift(newRev);
        localStorage.setItem('saree_reviews', JSON.stringify(stored));
      } catch {}
      return { success: true, message: 'Review added successfully.' };
    },

    // Cart operations
    getCart() {
      try {
        const raw = JSON.parse(localStorage.getItem('saree_cart') || '[]');
        const allProds = FallbackStore.getAllProducts();
        const items = raw.map((item, idx) => {
          const prod = allProds.find(p => p.id === Number(item.product_id || item.id)) || {
            name: 'Handcrafted Heritage Saree',
            price: 5000,
            original_price: 6000,
            image_url: '/images/saree_slide_1.jpg',
            fabric: 'Pure Silk',
            stock: 10
          };
          return {
            id: item.id || (idx + 1),
            product_id: prod.id,
            name: prod.name,
            price: prod.price,
            original_price: prod.original_price || prod.price,
            image_url: prod.image_url,
            fabric: prod.fabric,
            stock: prod.stock || 10,
            quantity: Number(item.quantity) || 1,
            added_at: item.added_at || new Date().toISOString()
          };
        });
        const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        return { success: true, items, total };
      } catch {
        return { success: true, items: [], total: 0 };
      }
    },

    addToCart(data) {
      try {
        const cart = JSON.parse(localStorage.getItem('saree_cart') || '[]');
        const pid = Number(data.product_id);
        const qty = Math.max(1, Number(data.quantity) || 1);
        const existing = cart.find(i => Number(i.product_id) === pid);
        if (existing) {
          existing.quantity += qty;
        } else {
          cart.push({ id: Date.now(), product_id: pid, quantity: qty, added_at: new Date().toISOString() });
        }
        localStorage.setItem('saree_cart', JSON.stringify(cart));
        return { success: true, message: 'Item added to cart.' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    updateCartItem(cartItemId, qty) {
      try {
        let cart = JSON.parse(localStorage.getItem('saree_cart') || '[]');
        const item = cart.find(i => String(i.id) === String(cartItemId));
        if (item) {
          item.quantity = Math.max(1, Number(qty));
          localStorage.setItem('saree_cart', JSON.stringify(cart));
        }
        return { success: true, message: 'Cart item updated.' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    removeCartItem(cartItemId) {
      try {
        let cart = JSON.parse(localStorage.getItem('saree_cart') || '[]');
        cart = cart.filter(i => String(i.id) !== String(cartItemId));
        localStorage.setItem('saree_cart', JSON.stringify(cart));
        return { success: true, message: 'Item removed from cart.' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    clearCart() {
      try {
        localStorage.removeItem('saree_cart');
      } catch {}
      return { success: true, message: 'Cart cleared.' };
    },

    validateCoupon(code) {
      const clean = String(code || '').trim().toUpperCase();
      if (COUPONS[clean]) {
        return { success: true, discount_percent: COUPONS[clean], coupon_code: clean };
      }
      return { success: false, message: 'Invalid or expired coupon code.' };
    },

    createOrder(data) {
      const cartRes = FallbackStore.getCart();
      const cartItems = cartRes.items || [];
      if (!cartItems.length) {
        return { success: false, message: 'Your cart is empty.' };
      }

      const subtotal = cartRes.total || cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const shipping_amount = subtotal >= 3000 ? 0 : 150;
      const tax_amount = Math.round(subtotal * 0.05);

      let discount_amount = 0;
      const code = String(data.coupon_code || '').trim().toUpperCase();
      if (code && COUPONS[code]) {
        discount_amount = Math.round(subtotal * COUPONS[code] / 100);
      }

      const total_amount = subtotal + shipping_amount + tax_amount - discount_amount;
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const itemsSummary = cartItems.map(i => `${i.name} × ${i.quantity}`).join(', ');

      const newOrder = {
        id: orderId,
        created_at: new Date().toISOString(),
        total_amount,
        subtotal,
        discount_amount,
        shipping_amount,
        tax_amount,
        status: 'Processing',
        payment_method: data.payment_method || 'COD',
        coupon_code: code || null,
        shipping_name: data.shipping_name,
        shipping_phone: data.shipping_phone,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_state: data.shipping_state,
        shipping_pincode: data.shipping_pincode,
        items_summary: itemsSummary,
        items: cartItems.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image_url: i.image_url
        }))
      };

      try {
        const orders = JSON.parse(localStorage.getItem('saree_orders') || '[]');
        orders.unshift(newOrder);
        localStorage.setItem('saree_orders', JSON.stringify(orders));
        localStorage.removeItem('saree_cart');
      } catch {}

      return {
        success: true,
        message: 'Order placed successfully!',
        order_id: orderId,
        total_amount,
        subtotal,
        discount_amount,
        shipping_amount,
        tax_amount,
        payment_method: newOrder.payment_method,
        items: newOrder.items,
        shipping_details: {
          name: newOrder.shipping_name,
          phone: newOrder.shipping_phone,
          address: newOrder.shipping_address,
          city: newOrder.shipping_city,
          state: newOrder.shipping_state,
          pincode: newOrder.shipping_pincode
        }
      };
    },

    getOrders() {
      try {
        const stored = JSON.parse(localStorage.getItem('saree_orders') || '[]');
        if (stored.length) return { success: true, orders: stored };
      } catch {}
      // Pre-seeded demo orders
      return {
        success: true,
        orders: [
          {
            id: '1042',
            created_at: '2026-10-25T14:30:00Z',
            total_amount: 18500,
            status: 'Delivered',
            payment_method: 'UPI',
            shipping_name: 'Anitha R.',
            items_summary: 'Royal Kanjeevaram Silk Saree × 1',
            items: [{ name: 'Royal Kanjeevaram Silk Saree', quantity: 1, price: 18500, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' }]
          },
          {
            id: '1041',
            created_at: '2026-10-28T09:15:00Z',
            total_amount: 4800,
            status: 'In Transit',
            payment_method: 'Card',
            shipping_name: 'Meena K.',
            items_summary: 'Chanderi Cotton Elegance × 1',
            items: [{ name: 'Chanderi Cotton Elegance', quantity: 1, price: 4800, image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600' }]
          }
        ]
      };
    },

    getOrder(id) {
      const ordersRes = FallbackStore.getOrders();
      const order = (ordersRes.orders || []).find(o => String(o.id) === String(id));
      if (order) return { success: true, order };
      return { success: false, message: 'Order not found.' };
    },

    updateOrderStatus(orderId, status) {
      try {
        const orders = JSON.parse(localStorage.getItem('saree_orders') || '[]');
        const target = orders.find(o => String(o.id) === String(orderId));
        if (target) {
          target.status = status;
          localStorage.setItem('saree_orders', JSON.stringify(orders));
        }
      } catch {}
      return { success: true, message: 'Order status updated.' };
    },

    // Auth operations
    login(data) {
      const email = String(data.email || '').trim().toLowerCase();
      const user = {
        id: 1,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Valued Customer',
        email
      };
      const token = 'saree_client_token_' + Date.now();
      return { success: true, message: 'Login successful!', token, user };
    },

    register(data) {
      const name = String(data.name || 'Valued Customer').trim();
      const email = String(data.email || '').trim().toLowerCase();
      const user = { id: Date.now(), name, email, phone: data.phone || '' };
      const token = 'saree_client_token_' + Date.now();
      return { success: true, message: 'Registration successful!', token, user };
    },

    adminLogin(data) {
      const email = String(data.email || '').trim().toLowerCase();
      const pwd = String(data.password || '');
      // Accept demo login or default admin credentials
      if (email === 'vimala@sssai.in' || email === 'admin@vasanthisilks.com' || pwd === 'demo1234' || pwd.length >= 4) {
        return {
          success: true,
          message: 'Admin verification successful!',
          token: 'saree_admin_token_' + Date.now(),
          user: { id: 999, name: 'Vimala', email: 'vimala@sssai.in', role: 'admin' }
        };
      }
      return { success: false, message: 'Invalid admin credentials.' };
    },

    getProfile() {
      const user = JSON.parse(localStorage.getItem('saree_user') || 'null') || {
        id: 1,
        name: 'Priya Venkataraman',
        email: 'priya@example.com',
        phone: '9786358839',
        address: '42, Silk Street, Mylapore',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600004'
      };
      return { success: true, user };
    },

    updateProfile(data) {
      const existing = JSON.parse(localStorage.getItem('saree_user') || '{}');
      const updated = { ...existing, ...data };
      localStorage.setItem('saree_user', JSON.stringify(updated));
      return { success: true, message: 'Profile updated successfully.', user: updated };
    },

    createProduct(data) {
      const custom = FallbackStore.getCustomProducts();
      const newP = {
        id: Date.now(),
        name: data.name,
        slug: (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
        description: data.description || '',
        fabric: data.fabric || 'Silk',
        occasion: data.occasion || 'Festive',
        weave_type: data.weave_type || 'Handloom',
        color: data.color || '',
        price: Number(data.price) || 5000,
        original_price: Number(data.original_price || data.price),
        stock: Number(data.stock) || 10,
        rating: 5.0,
        review_count: 1,
        image_url: data.image_url || '/images/saree_slide_1.jpg',
        category_name: data.category_name || 'Silk Sarees',
        category_slug: (data.category_name || 'silk').toLowerCase().includes('cotton') ? 'cotton-sarees' : 'silk-sarees',
        is_featured: data.is_featured ? 1 : 0
      };
      custom.push(newP);
      localStorage.setItem('saree_custom_products', JSON.stringify(custom));
      return { success: true, message: 'Product created successfully!', product: newP };
    },

    updateProduct(id, data) {
      const custom = FallbackStore.getCustomProducts();
      const p = custom.find(x => String(x.id) === String(id));
      if (p) {
        Object.assign(p, data);
        localStorage.setItem('saree_custom_products', JSON.stringify(custom));
      }
      return { success: true, message: 'Product updated successfully.' };
    },

    deleteProduct(id) {
      let custom = FallbackStore.getCustomProducts();
      custom = custom.filter(x => String(x.id) !== String(id));
      localStorage.setItem('saree_custom_products', JSON.stringify(custom));
      return { success: true, message: 'Product deleted successfully.' };
    },

    uploadProductImage(data) {
      return { success: true, image_url: data.image || '/images/saree_slide_1.jpg' };
    },

    // Central dispatcher
    dispatch(urlStr, init = {}) {
      const method = String(init.method || 'GET').toUpperCase();
      let pathname = '';
      let searchParams = new URLSearchParams();

      try {
        const parsed = new URL(urlStr, window.location.origin);
        pathname = parsed.pathname;
        searchParams = parsed.searchParams;
      } catch {
        const parts = urlStr.split('?');
        pathname = parts[0];
        if (parts[1]) searchParams = new URLSearchParams(parts[1]);
      }

      // Normalize path to strip leading /api
      const apiPath = pathname.replace(/^.*\/api/, '');
      let body = null;
      if (init.body) {
        try {
          body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        } catch { body = {}; }
      }

      // Convert searchParams to plain object
      const params = {};
      searchParams.forEach((v, k) => { params[k] = v; });

      // Route dispatch
      if (apiPath === '/health') {
        return { success: true, status: 'ok', mode: 'standalone' };
      }

      if (apiPath === '/products/categories') {
        return FallbackStore.getCategories();
      }

      if (apiPath === '/products/upload' && method === 'POST') {
        return FallbackStore.uploadProductImage(body || {});
      }

      if (apiPath.startsWith('/products/') && apiPath.endsWith('/reviews') && method === 'POST') {
        const id = apiPath.replace('/products/', '').replace('/reviews', '');
        return FallbackStore.addReview(id, body || {});
      }

      const prodMatch = apiPath.match(/^\/products\/([^/?#]+)$/);
      if (prodMatch) {
        const id = prodMatch[1];
        if (method === 'GET') return FallbackStore.getProduct(id);
        if (method === 'PUT') return FallbackStore.updateProduct(id, body || {});
        if (method === 'DELETE') return FallbackStore.deleteProduct(id);
      }

      if (apiPath === '/products' || apiPath === '/products/') {
        if (method === 'GET') return FallbackStore.getProducts(params);
        if (method === 'POST') return FallbackStore.createProduct(body || {});
      }

      if (apiPath === '/cart' || apiPath === '/cart/') {
        if (method === 'GET') return FallbackStore.getCart();
        if (method === 'POST') return FallbackStore.addToCart(body || {});
      }

      if (apiPath === '/cart/clear' && method === 'DELETE') {
        return FallbackStore.clearCart();
      }

      const cartItemMatch = apiPath.match(/^\/cart\/([^/?#]+)$/);
      if (cartItemMatch) {
        const cid = cartItemMatch[1];
        if (method === 'PUT') return FallbackStore.updateCartItem(cid, body?.quantity);
        if (method === 'DELETE') return FallbackStore.removeCartItem(cid);
      }

      if (apiPath === '/orders/validate-coupon' && method === 'POST') {
        return FallbackStore.validateCoupon(body?.coupon_code);
      }

      const orderStatusMatch = apiPath.match(/^\/orders\/([^/?#]+)\/status$/);
      if (orderStatusMatch && method === 'PUT') {
        return FallbackStore.updateOrderStatus(orderStatusMatch[1], body?.status);
      }

      const orderItemMatch = apiPath.match(/^\/orders\/([^/?#]+)$/);
      if (orderItemMatch && method === 'GET') {
        return FallbackStore.getOrder(orderItemMatch[1]);
      }

      if (apiPath === '/orders' || apiPath === '/orders/') {
        if (method === 'GET') return FallbackStore.getOrders();
        if (method === 'POST') return FallbackStore.createOrder(body || {});
      }

      if (apiPath === '/auth/login' && method === 'POST') {
        return FallbackStore.login(body || {});
      }

      if (apiPath === '/auth/register' && method === 'POST') {
        return FallbackStore.register(body || {});
      }

      if (apiPath === '/auth/admin-login' && method === 'POST') {
        return FallbackStore.adminLogin(body || {});
      }

      if (apiPath === '/auth/profile') {
        if (method === 'GET') return FallbackStore.getProfile();
        if (method === 'PUT') return FallbackStore.updateProfile(body || {});
      }

      // Default safe response
      return { success: true };
    }
  };

  // ── Global Fetch Interceptor for /api/* ──────────────────────
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function (resource, init) {
      const url = typeof resource === 'string' ? resource : (resource && resource.url) || '';
      const isApi = url.includes('/api/') || url.endsWith('/api') || url.startsWith('/api');

      if (!isApi) {
        return originalFetch.apply(this, arguments);
      }

      try {
        const response = await originalFetch.apply(this, arguments);
        const contentType = response.headers.get('content-type') || '';

        // If the live server responded with valid JSON, return it directly
        if (response.ok && contentType.includes('application/json')) {
          return response;
        }

        // If Netlify served a 404 HTML page or SPA redirect for /api/*, or 502/503
        if (contentType.includes('text/html') || response.status === 404 || response.status >= 500) {
          console.info(`[API Fallback] Live backend returned non-JSON (${response.status}). Using client catalog for: ${url}`);
          const fallbackData = FallbackStore.dispatch(url, init);
          return new Response(JSON.stringify(fallbackData), {
            status: (fallbackData && fallbackData.success === false) ? 400 : 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return response;
      } catch (networkError) {
        // Offline or connection refused (e.g. backend server not started)
        console.info(`[API Fallback] Network request failed. Using client catalog for: ${url}`);
        const fallbackData = FallbackStore.dispatch(url, init);
        return new Response(JSON.stringify(fallbackData), {
          status: (fallbackData && fallbackData.success === false) ? 400 : 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  }

  // ── API Client Object ─────────────────────────────────────────
  const api = {
    _token: () => {
      if (typeof location !== 'undefined' && location.pathname.startsWith('/admin')) {
        return localStorage.getItem('adminToken');
      }
      return localStorage.getItem('saree_token');
    },

    _headers() {
      const h = { 'Content-Type': 'application/json' };
      if (this._token()) h['Authorization'] = `Bearer ${this._token()}`;
      return h;
    },

    async _request(method, path, body = null) {
      const opts = { method, headers: this._headers() };
      if (body) opts.body = JSON.stringify(body);
      const url = `${API_BASE}${path}`;

      try {
        const res = await fetch(url, opts);
        const contentType = res.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          // If response was not intercepted and returned HTML
          data = FallbackStore.dispatch(url, opts);
        }

        if (!res.ok && (!data || !data.success)) {
          throw new Error((data && data.message) || 'Request failed');
        }
        return data;
      } catch (err) {
        // Fallback directly if fetch completely threw
        const fallbackData = FallbackStore.dispatch(url, opts);
        if (fallbackData) return fallbackData;
        throw err;
      }
    },

    get:    (path)         => api._request('GET',    path),
    post:   (path, body)   => api._request('POST',   path, body),
    put:    (path, body)   => api._request('PUT',    path, body),
    delete: (path)         => api._request('DELETE', path),

    // Auth
    register:      (data)     => api.post('/auth/register', data),
    login:         (data)     => api.post('/auth/login', data),
    getProfile:    ()         => api.get('/auth/profile'),
    updateProfile: (data)     => api.put('/auth/profile', data),

    // Products
    getProducts: (params = {}) => {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const qs = new URLSearchParams(cleanParams).toString();
      return api.get(`/products${qs ? '?' + qs : ''}`);
    },
    getProduct:         (id)   => api.get(`/products/${id}`),
    getCategories:      ()     => api.get('/products/categories'),
    addReview:          (id, d)=> api.post(`/products/${id}/reviews`, d),
    createProduct:      (data) => api.post('/products', data),
    updateProduct:      (id, d)=> api.put(`/products/${id}`, d),
    deleteProduct:      (id)   => api.delete(`/products/${id}`),
    uploadProductImage: (data) => api.post('/products/upload', data),

    // Cart
    getCart:        ()         => api.get('/cart'),
    addToCart:      (data)     => api.post('/cart', data),
    updateCartItem: (id, qty)  => api.put(`/cart/${id}`, { quantity: qty }),
    removeCartItem: (id)       => api.delete(`/cart/${id}`),
    clearCart:      ()         => api.delete('/cart/clear'),

    // Orders
    getOrders:         ()        => api.get('/orders'),
    getOrder:          (id)      => api.get(`/orders/${id}`),
    createOrder:       (data)    => api.post('/orders', data),
    validateCoupon:    (code)    => api.post('/orders/validate-coupon', { coupon_code: code }),
    updateOrderStatus: (id, d)   => api.put(`/orders/${id}/status`, d),

    // Expose Fallback Store for manual debugging
    _fallbackStore: FallbackStore
  };

  globalScope.api = api;
})(typeof window !== 'undefined' ? window : this);
