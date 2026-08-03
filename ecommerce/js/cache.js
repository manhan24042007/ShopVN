/**
 * cache.js — API Response Cache (sessionStorage) + PWA utils
 * Giúp tránh gọi API lặp lại trong cùng một phiên
 */

const Cache = (() => {
  const PREFIX  = 'shopvn_cache_';
  const TTL_MS  = 5 * 60 * 1000; // 5 phút

  function key(endpoint) { return PREFIX + endpoint; }

  function get(endpoint) {
    try {
      const raw = sessionStorage.getItem(key(endpoint));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL_MS) { sessionStorage.removeItem(key(endpoint)); return null; }
      return data;
    } catch { return null; }
  }

  function set(endpoint, data) {
    try {
      sessionStorage.setItem(key(endpoint), JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // sessionStorage full — clear old entries
      clearExpired();
    }
  }

  function clearExpired() {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        try {
          const { ts } = JSON.parse(sessionStorage.getItem(k));
          if (Date.now() - ts > TTL_MS) sessionStorage.removeItem(k);
        } catch { sessionStorage.removeItem(k); }
      }
    }
  }

  function clearAll() {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(PREFIX)) sessionStorage.removeItem(k);
    }
  }

  // Patch API.request để dùng cache
  function patchAPI() {
    if (typeof API === 'undefined') return;
    const originalRequest = API._request;
    if (!originalRequest) return;
    // Already patched in api.js via cachedRequest
  }

  return { get, set, clearExpired, clearAll };
})();


/* ── Service Worker Registration (PWA) ──────────────── */
// SW chỉ đăng ký sau khi user đã vào trang lần 2+ để tránh cache cũ
// Không đăng ký tự động ở đây nữa
