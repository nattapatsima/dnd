// Offline cache for every character page. Every publish bumps CACHE together with the
// buildVersion of every character whose build file changed.
const CACHE = 'quickstep-v9';
const ASSETS = [
  './',
  './index.html',
  './css/sheet.css',
  './js/boot.js',
  './js/start.js',
  './js/main.js',
  './js/character.js',
  './js/trance-options.js',
  './js/derive.js',
  './js/state.js',
  './js/storage.js',
  './js/render-play.js',
  './js/render-tabs.js',
  './manifest.webmanifest',
  './dyme/',
  './dyme/index.html',
  './dyme/boot.js',
  './dyme/manifest.webmanifest',
  './js/characters/dyme.js',
  './bard/',
  './bard/index.html',
  './bard/boot.js',
  './bard/manifest.webmanifest',
  './js/characters/bard.js',
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

// Each character page and its offline shell. A page visit that misses the cache gets its own
// page's shell, never another character's.
const PAGES = ['./dyme/', './bard/'];

function shellFor(url) {
  const path = new URL(url).pathname;
  const page = PAGES.find((p) => {
    const base = new URL(p, self.location).pathname;
    return path === base.replace(/\/$/, '') || path.startsWith(base);
  });
  return page ? `${page}index.html` : './index.html';
}

function fromCache(request) {
  return caches.match(request, { ignoreSearch: true })
    .then((hit) => hit || (request.mode === 'navigate' ? caches.match(shellFor(request.url)) : undefined));
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
