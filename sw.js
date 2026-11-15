const V='karten-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* App-Dateien und Firebase-Skripte: sofort aus dem Cache, im Hintergrund aktualisieren (funktioniert dadurch auch offline).
   Datenverkehr zu Firestore und Anmeldung geht an diesem Service Worker vorbei. */
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||!(u.origin===location.origin||u.hostname==='www.gstatic.com'))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res.ok&&res.status===200)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
