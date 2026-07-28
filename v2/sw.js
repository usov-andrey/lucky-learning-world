/**
 * Service Worker for Lucky's Learning World v2.0.0-v19
 * Uses Network-First strategy to guarantee instant updates on production!
 */

const CACHE_NAME = 'lucky-world-v2.0.0-v19';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('lucky-world-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Ignore non-GET requests or browser extension requests
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  // Network-First with Cache Fallback for offline play
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
  );
});
