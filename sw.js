const CACHE='future-life-v16';
const ASSETS=['./','./index.html','./styles.css','./app.js','./sync.js','./tools.js','./theme.js','./pdf.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;

  event.respondWith(
    fetch(req)
      .then(res=>{
        if(res&&res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      })
      .catch(async()=>{
        const cached=await caches.match(req);
        if(cached)return cached;
        // 只有真正的頁面導覽才回首頁；JS/CSS 等資源失敗時不可拿 HTML 冒充，避免整站腳本報錯。
        if(req.mode==='navigate')return caches.match('./index.html');
        return Response.error();
      })
  );
});
