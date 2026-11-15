// Offline cache for the sheet. Bump CACHE together with CHARACTER.buildVersion on every publish.
const CACHE = 'quickstep-v4';
const ASSETS = [
  './',
  './index.html',
  './css/sheet.css',
  './js/boot.js',
  './js/main.js',
  './js/character.js',
  './js/derive.js',
  './js/state.js',
  './js/storage.js',
  './js/render-play.js',
  './js/render-tabs.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// On the local dev server, prefer fresh files (falling back to the cache when the server is down).
// On the real site, the cache answers first: instant start, and it works with no signal.
const DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the HTTP cache so a new version never precaches stale files.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function fromCache(request) {
  return caches.match(request, { ignoreSearch: true })
    .then((hit) => hit || (request.mode === 'navigate' ? caches.match('./index.html') : undefined));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (DEV) {
    event.respondWith(fetch(request).catch(() => fromCache(request).then((hit) => hit || Response.error())));
    return;
  }
  event.respondWith(fromCache(request).then((hit) => hit || fetch(request)));
});
