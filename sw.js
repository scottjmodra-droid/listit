const CACHE='listit-v9';
const FB=['https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./',...FB]).catch(()=>c.add('./'))));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('listit')).map(k=>caches.delete(k)))));
  self.clients.claim();
});

// Open instantly from the saved copy, and fetch any update in the background for next time.
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  const mine=u.startsWith(self.location.origin)&&!u.includes('/cookit/');
  const fb=u.startsWith('https://www.gstatic.com/firebasejs/');
  if(e.request.method!=='GET'||!(mine||fb))return;
  e.respondWith(
    caches.match(e.request,{ignoreSearch:mine}).then(cached=>{
      const net=fetch(e.request).then(res=>{
        if(res.ok)caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        return res;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});
