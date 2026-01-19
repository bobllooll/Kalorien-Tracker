const CACHE_NAME = 'nutriscan-v77';
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

// Aufräumen alter Caches (WICHTIG für Updates!)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Anfragen abfangen (Offline-First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Wenn im Cache, dann nehmen. Sonst Netzwerk.
      // Wenn Netzwerk fehlschlägt (Offline) und es eine Navigation ist -> index.html
      return response || fetch(e.request).catch((error) => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw error; // WICHTIG: Fehler weiterwerfen, damit app.js ihn fangen kann!
      });
    })
  );
});