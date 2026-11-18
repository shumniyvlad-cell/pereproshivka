// Офлайн: страница — из сети, а без сети из кеша; файлы сборки и фото — из кеша.
const CACHE = 'pereproshivka-v1';
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './photo/today.webp', './photo/calm.webp', './photo/dream.webp', './photo/morning.webp'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }
  e.respondWith(
    caches.match(r).then(
      (hit) =>
        hit ||
        fetch(r).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(r, copy));
          }
          return res;
        }),
    ),
  );
});
