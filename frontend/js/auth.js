// ── Auth State Management ──────────────────────────────────
const auth = {
  getToken:   () => localStorage.getItem('saree_token'),
  getUser:    () => JSON.parse(localStorage.getItem('saree_user') || 'null'),
  isLoggedIn: () => !!auth.getToken(),

  setSession(token, user) {
    localStorage.setItem('saree_token', token);
    localStorage.setItem('saree_user', JSON.stringify(user));
    auth.updateUI();
  },

  clearSession() {
    localStorage.removeItem('saree_token');
    localStorage.removeItem('saree_user');
    auth.updateUI();
  },

  logout() {
    auth.clearSession();
    showToast('Logged out successfully.', 'success');
    setTimeout(() => window.location.href = '/', 800);
  },

  updateUI() {
    const user = auth.getUser();
    const loginLink  = document.getElementById('nav-login-link');
    const userMenu   = document.getElementById('nav-user-menu');
    const userName   = document.getElementById('nav-user-name');
    const logoutBtn  = document.getElementById('nav-logout-btn');

    if (auth.isLoggedIn() && user) {
      if (loginLink) loginLink.classList.add('hidden');
      if (userMenu) userMenu.classList.remove('hidden');
      if (userName) userName.textContent = user.name.split(' ')[0];
    } else {
      if (loginLink) loginLink.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
    }
    if (logoutBtn) logoutBtn.addEventListener('click', auth.logout);
  },

  requireAuth() {
    if (!auth.isLoggedIn()) {
      showToast('Please log in to continue.', 'error');
      setTimeout(() => window.location.href = '/pages/login.html', 800);
      return false;
    }
    return true;
  }
};

window.auth = auth;
document.addEventListener('DOMContentLoaded', () => auth.updateUI());
