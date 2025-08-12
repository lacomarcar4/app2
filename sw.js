self.addEventListener('install',e=>{
  e.waitUntil(caches.open('lc-v1').then(c=>c.addAll([
    '/', '/index.html','/styles.css','/app.js','/manifest.json',
    '/data/menu.json','/data/juegos.json','/data/eventos.json','/assets/icon-192.png','/assets/icon-512.png'
  ])));
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});