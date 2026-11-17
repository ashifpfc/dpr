const CACHE = 'pfc-dpr-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

// Only the shell (this site's own files) goes through the cache.
// The DPR app itself always loads fresh from the network inside its frame.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (the DPR app) pass straight through
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
