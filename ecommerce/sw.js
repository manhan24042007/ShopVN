/**
 * sw.js — Service Worker v4
 * Xóa toàn bộ cache cũ khi activate
 */

const CACHE_NAME   = 'shopvn-v4';
const STATIC_CACHE = 'shopvn-static-v4';

const STATIC_ASSETS = [
  '/index.html',
  '/products.html',
  '/cart.html',
  '/checkout.html',
  '/css/style.css',
  '/js/api.js',
  '/js/auth.js',
  '/js/cart.js',
  '/js/main.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
            .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bỏ qua via.placeholder.com hoàn toàn
  if (url.hostname.includes('placeholder')) return;

  // API — network first
  if (url.hostname === 'fakestoreapi.com') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static — cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached ||
      fetch(event.request).then(res => {
        if (res.ok && event.request.method === 'GET') {
          caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
    ).catch(() => caches.match('/404.html'))
  );
});
