/**
 * SS SAI ENTERPRISES — Production Build Script for Netlify
 *
 * Prepares the production bundle in the `dist` directory:
 * 1. Copies all customer-facing storefront files from `frontend/` into `dist/`.
 * 2. Copies all administrative portal files from `admin/` into `dist/admin/`.
 * 3. Injects runtime API configuration from process.env.API_BASE_URL into `dist/js/config.js`.
 * 4. Generates Netlify `dist/_redirects` file for clean SPA / deep routing.
 * 5. Runs a comprehensive asset and routing verification check.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Read API_BASE_URL from environment (provided by Netlify environment variables)
const rawApiBaseUrl = process.env.API_BASE_URL || '';
const sanitizedApiBaseUrl = rawApiBaseUrl ? String(rawApiBaseUrl).trim().replace(/\/+$/, '') : '';

console.log('------------------------------------------------------------');
console.log('🥻 SS SAI ENTERPRISES — NETLIFY PRODUCTION BUILD');
console.log('------------------------------------------------------------');
console.log(`➜ Target Publish Directory : ${DIST_DIR}`);
console.log(`➜ Configured API_BASE_URL  : ${sanitizedApiBaseUrl || '(none - defaulting to /api)'}`);

// Helper: copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper: count files recursively
function countFiles(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return count;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// 1. Clean and recreate dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 2. Copy frontend storefront into dist
console.log('📦 Copying frontend storefront files...');
copyDirRecursive(FRONTEND_DIR, DIST_DIR);

// 3. Copy admin console into dist/admin
console.log('🔐 Copying admin console files into dist/admin...');
const distAdminDir = path.join(DIST_DIR, 'admin');
copyDirRecursive(ADMIN_DIR, distAdminDir);

// 4. Inject runtime config into dist/js/config.js and dist/admin/js/config.js
console.log('⚙️  Generating runtime config (js/config.js)...');
const configContent = `/**
 * SS SAI ENTERPRISES — Runtime Environment Configuration
 * Generated automatically during Netlify build.
 */
(function (root) {
  'use strict';
  var globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : root);
  globalScope.API_BASE_URL = ${JSON.stringify(sanitizedApiBaseUrl)};

  function resolveApiBase() {
    var raw = globalScope.API_BASE_URL ? String(globalScope.API_BASE_URL).trim().replace(/\\/+$/, '') : '';
    if (!raw) return '/api';
    return raw.endsWith('/api') ? raw : (raw + '/api');
  }

  globalScope.API_BASE = resolveApiBase();
  globalScope.getApiUrl = function (path) {
    var p = String(path || '');
    if (!p.startsWith('/')) p = '/' + p;
    return globalScope.API_BASE + p;
  };
})(this);
`;

const distJsDir = path.join(DIST_DIR, 'js');
if (!fs.existsSync(distJsDir)) fs.mkdirSync(distJsDir, { recursive: true });
fs.writeFileSync(path.join(distJsDir, 'config.js'), configContent, 'utf8');

const distAdminJsDir = path.join(distAdminDir, 'js');
if (!fs.existsSync(distAdminJsDir)) fs.mkdirSync(distAdminJsDir, { recursive: true });
fs.writeFileSync(path.join(distAdminJsDir, 'config.js'), configContent, 'utf8');

// 5. Generate Netlify _redirects file
console.log('🔀 Generating Netlify _redirects file...');
const redirectsContent = `# ─────────────────────────────────────────────────────────────
# SS SAI ENTERPRISES — Netlify SPA & Clean URL Redirects
# ─────────────────────────────────────────────────────────────

# Storefront Clean Routes
/shop                /pages/shop.html       200
/product/:id         /pages/product.html    200
/product/*           /pages/product.html    200
/cart                /pages/cart.html       200
/checkout            /pages/checkout.html   200
/login               /pages/login.html      200
/register            /pages/register.html   200
/orders              /pages/orders.html     200
/welcome             /welcome.html          200

# Admin Console Routes
/admin               /admin/index.html      200
/admin/              /admin/index.html      200
/admin/dashboard     /admin/dashboard.html  200
/admin/*             /admin/:splat          200
`;

fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsContent, 'utf8');

// 6. Production Build Verification
console.log('🔍 Verifying production build integrity...');

const requiredFiles = [
  'index.html',
  'welcome.html',
  '_redirects',
  'js/config.js',
  'js/api.js',
  'js/auth.js',
  'js/cart.js',
  'js/main.js',
  'js/store-chrome.js',
  'js/welcome.js',
  'css/style.css',
  'css/components.css',
  'css/pages.css',
  'css/welcome.css',
  'pages/shop.html',
  'pages/product.html',
  'pages/cart.html',
  'pages/checkout.html',
  'pages/login.html',
  'pages/register.html',
  'pages/orders.html',
  'admin/index.html',
  'admin/dashboard.html'
];

let missingFiles = [];
for (const rel of requiredFiles) {
  const full = path.join(DIST_DIR, rel);
  if (!fs.existsSync(full)) {
    missingFiles.push(rel);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Build verification FAILED! Missing files:', missingFiles);
  process.exit(1);
}

const totalDistFiles = countFiles(DIST_DIR);
console.log('------------------------------------------------------------');
console.log(`✅ Production build SUCCEEDED! Total assets packaged: ${totalDistFiles}`);
console.log(`✅ Publish folder: dist/`);
console.log('------------------------------------------------------------');
