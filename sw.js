const CACHE = 'history-quiz-v5';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache HTML — always go to network
  if(e.request.destination === 'document'){
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if(resp.ok){
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }))
  );
});
