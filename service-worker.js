const localDate = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
const CACHE_NAME = `mckenzie-cache-${localDate}`;
const URLS_TO_CACHE = [
  './',
  './index.html',
  './data/addresses-new.geojson',
  './static/manifest.json',
  './static/mapmc.png',
  './css/style.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim(); // Immediately activate new service worker
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          if (event.request.url.includes('./data/addresses-new.geojson')) {
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, response.clone())
            );
          }
          return response;
        })
      );
    })
  );
});

// Listen for updates and activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
