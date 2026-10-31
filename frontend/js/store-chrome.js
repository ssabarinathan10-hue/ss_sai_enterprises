const WA_NUMBER = '919786358839';

function storeHeader(active = '') {
  return `
<div class="announcement-banner">
  <span>✦ Handcrafted Heritage Sarees &nbsp;·&nbsp; Free Insured Delivery on Orders &ge; ₹3,000 &nbsp;·&nbsp; Personal WhatsApp Guidance ✦</span>
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
      <a href="/shop" class="nav-action-btn" title="Search sarees" aria-label="Search">🔍</a>
      <a href="/cart" class="nav-action-btn" title="Shopping Bag" aria-label="Shopping bag">
        👜<span class="nav-badge cart-badge" style="display:none">0</span>
      </a>
      <a href="/login" class="nav-action-btn" id="nav-login-link" title="Sign In" aria-label="Sign in">
        👤
      </a>
      <div id="nav-user-menu" class="hidden" style="display:flex;align-items:center;gap:10px">
        <a href="/orders" class="nav-action-btn ${active === 'orders' ? 'active' : ''}" title="My Orders" aria-label="My Orders">
          📦<span id="nav-user-name" style="font-size:12px;margin-left:4px;font-weight:600"></span>
        </a>
        <button class="nav-action-btn" id="nav-logout-btn" type="button" title="Log out" aria-label="Log out">
          🚪
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
          <a class="wa-btn-pill" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello Vimala, I would like to enquire about SS Sai Enterprises sarees.')}">
            💬 Chat on WhatsApp
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
          <strong style="color:#E8CF94;font-size:15px;">+91 97863 58839</strong>
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
  <span>💬</span>
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
