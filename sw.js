// Recipe Book offline helper (version 2026-10-13-9790b049e3).
// Keeps a copy of the app on the phone. The page itself comes fresh from GitHub when the phone is online (so an
// upload shows up the next time you open the app) and from the saved copy when it isn't.
const CACHE = 'totk-book-2026-10-13-9790b049e3';
const FILES = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","marcellus-latin-400-normal.woff2","cinzel-latin-600-normal.woff2","cinzel-latin-700-normal.woff2","cinzel-latin-800-normal.woff2","nunito-latin-400-normal.woff2","nunito-latin-600-normal.woff2","nunito-latin-700-normal.woff2","nunito-latin-800-normal.woff2","nunito-latin-900-normal.woff2","map-surface-b703cdc2.webp","map-depths-810e5383.webp"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('totk-book-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const fromNet = (req, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('slow')), ms);
  fetch(req).then(res => { clearTimeout(t); resolve(res); }, err => { clearTimeout(t); reject(err); });
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // links out go to the web as usual
  if (req.mode === 'navigate') {
    e.respondWith(fromNet(req, 4000)
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); } return res; })
      .catch(() => caches.match('index.html').then(hit => hit || fetch(req))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
