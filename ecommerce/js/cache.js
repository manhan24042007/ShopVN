/**
 * cache.js — API Response Cache (localStorage 24h) + PWA utils
 * Lưu trong localStorage để dữ liệu KHÔNG BỊ MẤT khi user refresh / đóng tab,
 * giúp các trang so sánh / wishlist / cart-by-API hiển thị ngay cả khi API chậm.
 */
const Cache = (() => {
  const PREFIX  = 'shopvn_cache_';
  const TTL_MS  = 24 * 60 * 60 * 1000; // 24 giờ

  function key(endpoint) { return PREFIX + endpoint; }

  function get(endpoint) {
    try {
      const raw = localStorage.getItem(key(endpoint));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL_MS) { localStorage.removeItem(key(endpoint)); return null; }
      return data;
    } catch { return null; }
  }

  function set(endpoint, data) {
    try {
      localStorage.setItem(key(endpoint), JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // localStorage full — clear old entries
      clearExpired();
    }
  }

  function clearExpired() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        try {
          const { ts } = JSON.parse(localStorage.getItem(k));
          if (Date.now() - ts > TTL_MS) localStorage.removeItem(k);
        } catch { localStorage.removeItem(k); }
      }
    }
  }

  function clearAll() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  }

  // Preload cache for `/products` ngay khi script load
  (function preload() {
    try {
      const raw = localStorage.getItem(PREFIX + '/products');
      if (!raw) return;
      const { ts } = JSON.parse(raw);
      if (Date.now() - ts <= TTL_MS) return;
      localStorage.removeItem(PREFIX + '/products');
    } catch {}
  })();

  return { get, set, clearExpired, clearAll };
})();