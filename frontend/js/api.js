// ── API Client ─────────────────────────────────────────────
const API_BASE = (function () {
  if (typeof window !== 'undefined' && window.API_BASE) return window.API_BASE;
  const custom = (typeof window !== 'undefined' && window.API_BASE_URL) || '';
  if (!custom) return '/api';
  const clean = String(custom).trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
})();

window.API_BASE = API_BASE;

const api = {
  _token: () => {
    if (location.pathname.startsWith('/admin')) return localStorage.getItem('adminToken');
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
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get:    (path)         => api._request('GET',    path),
  post:   (path, body)   => api._request('POST',   path, body),
  put:    (path, body)   => api._request('PUT',    path, body),
  delete: (path)         => api._request('DELETE', path),

  // Auth
  register: (data)          => api.post('/auth/register', data),
  login:    (data)          => api.post('/auth/login', data),
  getProfile:()             => api.get('/auth/profile'),
  updateProfile: (data)     => api.put('/auth/profile', data),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString();
    return api.get(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct:       (id)    => api.get(`/products/${id}`),
  getCategories:    ()      => api.get('/products/categories'),
  addReview:        (id, d) => api.post(`/products/${id}/reviews`, d),
  createProduct:    (data)  => api.post('/products', data),
  updateProduct:    (id, d) => api.put(`/products/${id}`, d),
  deleteProduct:    (id)    => api.delete(`/products/${id}`),
  uploadProductImage: (data) => api.post('/products/upload', data),

  // Cart
  getCart:        ()          => api.get('/cart'),
  addToCart:      (data)      => api.post('/cart', data),
  updateCartItem: (id, qty)   => api.put(`/cart/${id}`, { quantity: qty }),
  removeCartItem: (id)        => api.delete(`/cart/${id}`),
  clearCart:      ()          => api.delete('/cart/clear'),

  // Orders
  getOrders:       ()        => api.get('/orders'),
  getOrder:        (id)      => api.get(`/orders/${id}`),
  createOrder:     (data)    => api.post('/orders', data),
  validateCoupon:  (code)    => api.post('/orders/validate-coupon', { coupon_code: code }),
  updateOrderStatus: (id, d) => api.put(`/orders/${id}/status`, d),
};


window.api = api;
