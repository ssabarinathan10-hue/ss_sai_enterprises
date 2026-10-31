// ── Global UI Utilities ───────────────────────────────────

// ── Toast Notification System ──
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

// ── Star Rating Helper ──
function renderStars(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="star${i < Math.round(rating) ? '' : ' empty'}">★</span>`
  ).join('');
}
window.renderStars = renderStars;

// ── Format Price ──
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}
window.formatPrice = formatPrice;

// ── Discount Percent ──
function discountPercent(orig, curr) {
  if (!orig || orig <= curr) return null;
  return Math.round((orig - curr) / orig * 100);
}
window.discountPercent = discountPercent;

// ── Sticky Navbar ──
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Mobile hamburger menu
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && currentPath === '/') {
      link.classList.add('active');
    }
  });
});

// ── Product Card Builder ──
function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
window.escapeHtml = escapeHtml;

function productUrl(product) {
  return `/product/${product.id}`;
}
window.productUrl = productUrl;

function buildProductCard(product) {
  const disc = discountPercent(product.original_price, product.price);
  const name = escapeHtml(product.name);
  const fabric = escapeHtml(product.fabric || product.category_name || 'Saree');
  const img = escapeHtml(product.image_url || '');
  const out = Number(product.stock) <= 0;
  return `
    <article class="product-card" data-id="${product.id}">
      <a class="product-card-img" href="${productUrl(product)}" aria-label="View ${name}">
        <img src="${img}" alt="${name}" loading="lazy" width="400" height="533" onerror="this.src='/images/saree_slide_1.jpg'">
        <div class="product-card-badges">
          ${disc ? `<span class="badge badge-sale">${disc}% off</span>` : ''}
          ${product.is_featured ? `<span class="badge badge-gold">Featured</span>` : ''}
          ${out ? `<span class="badge badge-crimson">Out of stock</span>` : ''}
        </div>
      </a>
      <div class="product-card-body">
        <div class="product-card-fabric">${fabric}</div>
        <h3 class="product-card-name"><a href="${productUrl(product)}">${name}</a></h3>
        ${Number(product.rating) > 0 ? `<div class="product-card-rating"><div class="stars">${renderStars(product.rating)}</div><span class="rating-count">(${Number(product.review_count || 0)})</span></div>` : ''}
        <div class="product-card-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${disc ? `<span class="price-original">${formatPrice(product.original_price)}</span>` : ''}
        </div>
        <div class="product-card-row">
          <a class="btn btn-outline btn-sm" href="${productUrl(product)}">View</a>
          <button class="product-card-add" type="button" ${out ? 'disabled' : ''} onclick="handleAddToCart(${product.id}, this.dataset.name)" data-name="${name}">
            ${out ? 'Unavailable' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  `;
}
window.buildProductCard = buildProductCard;

// ── Add to Cart from Card ──
async function handleAddToCart(productId, name) {
  try {
    await cartManager.addItem(productId, 1);
    showToast(`"${name}" added to cart!`, 'success');
  } catch (err) {
    const msg = err.message || 'Could not add to cart.';
    if (/log in|token|Access denied/i.test(msg)) {
      showToast('Please log in to add to cart.', 'error');
      setTimeout(() => { window.location.href = '/login'; }, 800);
    } else {
      showToast(msg, 'error');
    }
  }
}
window.handleAddToCart = handleAddToCart;

// ── Quick View (redirect to product page) ──
function quickView(productId) {
  window.location.href = `/product/${productId}`;
}
window.quickView = quickView;
