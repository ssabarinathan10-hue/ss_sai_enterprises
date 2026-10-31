/**
 * SS SAI ENTERPRISES — Runtime Environment Configuration
 *
 * This configuration file provides dynamic API resolution for local development
 * and production deployment on Netlify.
 *
 * When deploying to Netlify:
 * - Set the environment variable `API_BASE_URL` in Netlify Site Configuration.
 * - The Netlify build script (scripts/build.js) will inject that URL into dist/js/config.js.
 * - If API_BASE_URL is empty, it safely falls back to '/api' (same-origin / local Express server).
 */
(function (root) {
  'use strict';

  var globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : root);

  // Default empty (local / same-origin) unless injected at build time or set globally
  if (typeof globalScope.API_BASE_URL === 'undefined') {
    globalScope.API_BASE_URL = '';
  }

  function resolveApiBase() {
    var raw = globalScope.API_BASE_URL ? String(globalScope.API_BASE_URL).trim().replace(/\/+$/, '') : '';
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
