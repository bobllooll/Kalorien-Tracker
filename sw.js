const CACHE_NAME = 'nutriscan-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.svg'
];

// Installieren und Cachen
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Anfragen abfangen (Offline-First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});