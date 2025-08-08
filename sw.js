self.addEventListener('install', e=>{
  e.waitUntil(caches.open('dm-auth-v3').then(c=>c.addAll([
    './','./index.html','./assets/app.js?v=3','./assets/data.json','./manifest.json'
  ])));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});