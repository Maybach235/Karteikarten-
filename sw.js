/* Bei jeder neuen App-Version die Nummer hochzählen: Das löst auf den Geräten den Hinweis „Neue Version verfügbar“ aus. */
const V='karten-v15';
const FILES=['./','./index.html','./manifest.webmanifest','./config.js','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  /* Firebase-Skripte (Version in der Adresse festgelegt): aus dem Cache, nur beim ersten Mal aus dem Netz */
  if(u.hostname==='www.gstatic.com'){
    e.respondWith(caches.open(V).then(async c=>{
      const hit=await c.match(r);if(hit)return hit;
      const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res;
    }));
    return;
  }
  if(u.origin!==location.origin)return;
  /* Eigene Dateien: Netz zuerst (Updates kommen sofort an), bei Ausfall oder Funkloch der Cache */
  e.respondWith((async()=>{
    const c=await caches.open(V);
    try{
      const res=await Promise.race([fetch(r),new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),4000))]);
      if(res.ok&&res.status===200)c.put(r,res.clone());
      return res;
    }catch(err){
      const hit=await c.match(r,{ignoreSearch:true});
      return hit||Response.error();
    }
  })());
});
