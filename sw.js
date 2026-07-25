/**
 * Service Worker for Lucky's Learning World
 * Provides offline caching for seamless play on iPad without Wi-Fi
 */

const CACHE_NAME = 'lucky-world-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './reporter.js',
  './manifest.json',
  './engine/spelling-engine.js',
  './engine/share-controller.js',
  './engine/sound-fx.js',
  './content/spelling-catalog.js',
  './content/catalog.js',
  './pokemon/pikachu.png',
  './pokemon/eevee.png',
  './pokemon/charmander.png',
  './pokemon/bulbasaur.png',
  './pokemon/squirtle.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
