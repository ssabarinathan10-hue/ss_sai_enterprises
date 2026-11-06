const WA_NUMBER = '919786358839';

const CHROME_ICONS = {
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  bag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  box: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  whatsapp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.36C16.31 14.24 15.09 13.64 14.86 13.56C14.63 13.47 14.47 13.43 14.3 13.68C14.14 13.92 13.67 14.47 13.53 14.64C13.39 14.8 13.24 14.82 13 14.7C12.75 14.58 11.96 14.32 11.02 13.48C10.29 12.83 9.79 12.03 9.65 11.78C9.51 11.54 9.63 11.4 9.76 11.28C9.87 11.17 10.01 10.99 10.13 10.85C10.25 10.71 10.29 10.61 10.37 10.44C10.45 10.28 10.41 10.14 10.35 10.01C10.29 9.89 9.8 8.68 9.59 8.19C9.39 7.7 9.19 7.77 9.03 7.76C8.89 7.75 8.72 7.75 8.56 7.75C8.4 7.75 8.13 7.81 7.91 8.05C7.68 8.3 7.04 8.9 7.04 10.11C7.04 11.33 7.93 12.5 8.05 12.67C8.17 12.83 9.79 15.34 12.29 16.41C12.88 16.67 13.34 16.82 13.7 16.94C14.3 17.13 14.84 17.1 15.28 17.04C15.76 16.97 16.76 16.43 16.97 15.84C17.18 15.26 17.18 14.76 17.11 14.64C17.05 14.53 16.89 14.47 16.56 14.36Z"/></svg>`,
  truck: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  sparkle: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>`
};

function storeHeader(active = '') {
  return `
<div class="announcement-banner">
  <span>${CHROME_ICONS.sparkle} Handcrafted Heritage Sarees &nbsp;·&nbsp; ${CHROME_ICONS.truck} Free Insured Delivery on Orders &ge; ₹3,000 &nbsp;·&nbsp; ${CHROME_ICONS.whatsapp} Personal WhatsApp Guidance</span>
</div>
<nav class="navbar" id="store-nav">
  <div class="navbar-inner">
    <a href="/" class="navbar-logo" aria-label="SS Sai Enterprises home">
      <span class="navbar-logo-main">SS SAI</span>
      <span class="navbar-logo-sub">Enterprises</span>
    </a>
    <div class="navbar-nav">
      <a href="/" class="nav-link ${active === 'home' ? 'active' : ''}">Home</a>
      <a href="/shop" class="nav-link ${active === 'shop' ? 'active' : ''}">Shop All</a>
      <a href="/shop?category=silk-sarees" class="nav-link">Silk</a>
      <a href="/shop?category=cotton-sarees" class="nav-link">Cotton</a>
      <a href="/shop?category=designer-sarees" class="nav-link">Designer</a>
      <a href="/shop?category=bridal-sarees" class="nav-link">Bridal</a>
    </div>
    <div class="navbar-actions">
      <a href="/shop" class="nav-action-btn" title="Search sarees" aria-label="Search">${CHROME_ICONS.search}</a>
      <a href="/cart" class="nav-action-btn" title="Shopping Bag" aria-label="Shopping bag">
        ${CHROME_ICONS.bag}<span class="nav-badge cart-badge" style="display:none">0</span>
      </a>
      <a href="/login" class="nav-action-btn" id="nav-login-link" title="Sign In" aria-label="Sign in">
        ${CHROME_ICONS.user}
      </a>
      <div id="nav-user-menu" class="hidden" style="display:flex;align-items:center;gap:10px">
        <a href="/orders" class="nav-action-btn ${active === 'orders' ? 'active' : ''}" title="My Orders" aria-label="My Orders">
          ${CHROME_ICONS.box}<span id="nav-user-name" style="font-size:12px;margin-left:4px;font-weight:600"></span>
        </a>
        <button class="nav-action-btn" id="nav-logout-btn" type="button" title="Log out" aria-label="Log out">
          ${CHROME_ICONS.logout}
        </button>
      </div>
      <button class="nav-hamburger" type="button" onclick="toggleMobile()" aria-label="Open navigation menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a href="/" class="nav-link ${active === 'home' ? 'active' : ''}">Home</a>
  <a href="/shop" class="nav-link ${active === 'shop' ? 'active' : ''}">Shop All Sarees</a>
  <a href="/shop?category=silk-sarees" class="nav-link">Silk Sarees</a>
  <a href="/shop?category=cotton-sarees" class="nav-link">Cotton Sarees</a>
  <a href="/shop?category=designer-sarees" class="nav-link">Designer Sarees</a>
  <a href="/shop?category=bridal-sarees" class="nav-link">Bridal Collection</a>
  <a href="/cart" class="nav-link">Shopping Bag</a>
  <a href="/orders" class="nav-link ${active === 'orders' ? 'active' : ''}">My Orders</a>
  <a href="/login" class="nav-link">Account / Sign In</a>
</div>`;
}

function storeFooter() {
  return `
<footer class="footer store-footer">
  <div class="container">
    <div class="store-footer-grid">
      <div>
        <div class="navbar-logo" style="margin-bottom:14px">
          <span class="navbar-logo-main" style="color:#FFF9F1">SS SAI</span>
          <span class="navbar-logo-sub" style="color:#E8CF94">Enterprises</span>
        </div>
        <p style="color:#e0d2c7;font-size:14px;line-height:1.7;max-width:320px;">
          Curated by Vimala. Celebrating the beauty of Indian tradition, craftsmanship, and timeless saree elegance for every special moment.
        </p>
        <div style="margin-top:16px;">
          <a class="wa-btn-pill" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello Vimala, I would like to enquire about SS Sai Enterprises sarees.')}" style="display:inline-flex;align-items:center;gap:6px;">
            ${CHROME_ICONS.whatsapp} Chat on WhatsApp
          </a>
        </div>
      </div>
      <div>
        <h4>Collections</h4>
        <a href="/shop">All Sarees</a>
        <a href="/shop?category=silk-sarees">Pure Silk Sarees</a>
        <a href="/shop?category=cotton-sarees">Cotton &amp; Handloom</a>
        <a href="/shop?category=designer-sarees">Party &amp; Designer</a>
        <a href="/shop?category=bridal-sarees">Bridal Kanjeevaram</a>
      </div>
      <div>
        <h4>Customer Care</h4>
        <a href="/cart">Shopping Bag</a>
        <a href="/orders">Order Tracking</a>
        <a href="/login">Customer Account</a>
        <a href="/admin">Admin Console</a>
      </div>
      <div>
        <h4>Contact &amp; Assistance</h4>
        <p style="color:#e0d2c7;font-size:13px;line-height:1.6;margin-bottom:10px;">
          Direct WhatsApp Helpline:<br>
          <strong style="color:#E8CF94;font-size:15px;display:inline-flex;align-items:center;gap:6px;">${CHROME_ICONS.whatsapp} +91 97863 58839</strong>
        </p>
        <p style="color:#e0d2c7;font-size:12px;">Mon–Sat: 9:00 AM – 8:00 PM IST</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© ${new Date().getFullYear()} SS Sai Enterprises. All rights reserved. Handcrafted Indian Sarees.</div>
    </div>
  </div>
</footer>
<a class="wa-float" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello Vimala, I would like to enquire about SS Sai Enterprises sarees.')}" title="Message Vimala on WhatsApp">
  <span>${CHROME_ICONS.whatsapp}</span>
  <span class="wa-float-text">WhatsApp Us</span>
</a>
<div id="toast-container"></div>`;
}

function toggleMobile() {
  const menu = document.getElementById('mobile-menu');
  const burger = document.querySelector('.nav-hamburger');
  if (menu) menu.classList.toggle('open');
  if (burger) burger.classList.toggle('open');
}

window.storeHeader = storeHeader;
window.storeFooter = storeFooter;
window.toggleMobile = toggleMobile;
window.WA_NUMBER = WA_NUMBER;
