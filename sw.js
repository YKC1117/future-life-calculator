const CACHE='future-life-v17';
const ASSETS=['./','./index.html','./styles.css','./app.js','./sync.js','./tools.js','./theme.js','./pdf.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async asset=>{
      const res=await fetch(asset,{cache:'reload'});
      if(res.ok)await cache.put(asset,res.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;

  event.respondWith((async()=>{
    try{
      const res=await fetch(req);
      if(res&&res.ok){
        const cache=await caches.open(CACHE);
        cache.put(req,res.clone()).catch(()=>{});
      }
      return res;
    }catch{
      const cached=await caches.match(req);
      if(cached)return cached;
      if(req.mode==='navigate'){
        const home=await caches.match('./index.html');
        if(home)return home;
      }
      return Response.error();
    }
  })());
});
