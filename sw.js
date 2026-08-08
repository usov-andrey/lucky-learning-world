/**
 * Service Worker for Lucky's Learning World v1.4.0
 * Uses Network-First with forced HTTP cache bypass for scripts/styles to guarantee zero stale cache issues!
 */

const CACHE_NAME = 'lucky-world-v1.5.0';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
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

  const url = new URL(e.request.url);
  const isCodeOrMarkup = url.pathname.endsWith('.html') ||
                         url.pathname.endsWith('.js') ||
                         url.pathname.endsWith('.css') ||
                         url.pathname.endsWith('/') ||
                         url.pathname === '';

  // Network-First with forced HTTP cache bypass for scripts/styles/html
  const fetchOptions = isCodeOrMarkup ? { cache: 'no-cache' } : {};

  e.respondWith(
    fetch(e.request, fetchOptions)
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
