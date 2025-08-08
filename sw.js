// dm-v7: network-first for critical JS/JSON; cache-first for others
self.addEventListener('install', e=>{
  e.waitUntil(caches.open('dm-v7').then(c=>c.addAll([
    './','./index.html','./assets/app.js?v=5','./assets/data.json','./manifest.json'
  ])));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  const critical = url.href.includes('assets/app.js') || url.href.includes('assets/data.json');
  if (critical){
    // Network-first: always try live file
    e.respondWith(fetch(e.request).catch(()=> caches.match(e.request)));
    return;
  }
  // Cache-first for rest
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});