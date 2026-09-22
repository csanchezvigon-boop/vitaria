/* Vitaria Service Worker — caché básico de la app para uso offline.
   Estrategia: cache-first para assets estáticos; network-only para API. */
var CACHE = 'vitaria-v1';
var ASSETS = [
  '/portal.html',
  '/portal.js',
  '/portal.css',
  '/js/data.js',
  '/js/api.js',
  '/icon.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // Nunca cachear la API ni health
  if (url.pathname.startsWith('/api/') || url.pathname === '/health') return;
  // Solo GET de mismos-origen
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.status === 200 && url.pathname.endsWith('.html') === false) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      });
    })
  );
});