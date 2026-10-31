// ── Cart Manager ──────────────────────────────────────────
const cartManager = {
  _pending: new Set(),

  getLocal: () => JSON.parse(localStorage.getItem('saree_cart') || '[]'),
  setLocal: (items) => localStorage.setItem('saree_cart', JSON.stringify(items)),

  async getCount() {
    if (auth.isLoggedIn()) {
      try {
        const data = await api.getCart();
        return (data.items || []).reduce((s, i) => s + i.quantity, 0);
      } catch { return 0; }
    }
    return cartManager.getLocal().reduce((s, i) => s + i.quantity, 0);
  },

  async updateBadge() {
    const count = await cartManager.getCount();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  async addItem(productId, quantity = 1) {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) throw new Error('Enter a valid quantity.');
    const key = `add-${productId}`;
    if (cartManager._pending.has(key)) return;
    cartManager._pending.add(key);
    try {
      if (auth.isLoggedIn()) {
        await api.addToCart({ product_id: productId, quantity: qty });
      } else {
        throw new Error('Please log in to add items to your cart.');
      }
      await cartManager.updateBadge();
    } finally {
      cartManager._pending.delete(key);
    }
  },

  async updateItem(cartItemId, quantity) {
    const key = `upd-${cartItemId}`;
    if (cartManager._pending.has(key)) return;
    cartManager._pending.add(key);
    try {
      await api.updateCartItem(cartItemId, quantity);
      await cartManager.updateBadge();
    } finally {
      cartManager._pending.delete(key);
    }
  },

  async removeItem(cartItemId) {
    const key = `rm-${cartItemId}`;
    if (cartManager._pending.has(key)) return;
    cartManager._pending.add(key);
    try {
      await api.removeCartItem(cartItemId);
      await cartManager.updateBadge();
    } finally {
      cartManager._pending.delete(key);
    }
  }
};

window.cartManager = cartManager;
document.addEventListener('DOMContentLoaded', () => cartManager.updateBadge());
