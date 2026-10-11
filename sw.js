/*
  GlenApps
  © 2026 Ανδρέας Μ. Γλεντζάκης (Andreas M. Glentzakis). Με την επιφύλαξη παντός δικαιώματος.
*/
const CACHE="glenapps-0.4";
const SHELL=["./","./index.html","./manifest.json","./efarmoges.json",
  "./eikonidia/icon-192.png?v=0.4","./eikonidia/icon-512.png?v=0.4","./eikonidia/icon-512-maskable.png?v=0.4",
  "./eikonidia/apple-touch-icon.png?v=0.4","./eikonidia/G-glenapps.png?v=0.4"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith("glenapps-")&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data&&e.data.type==="skipWaiting")self.skipWaiting()});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  // μόνο τα δικά μας αρχεία· οι εφαρμογές έχουν τον δικό τους μηχανισμό
  if(u.origin!==location.origin||!u.pathname.startsWith(new URL("./",self.registration.scope).pathname))return;
  if(u.searchParams.has("probe"))return;
  // σελίδα και λίστα: πρώτα από το διαδίκτυο, αλλιώς από την προσωρινή μνήμη
  if(r.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname)||/efarmoges\.json$/.test(u.pathname)){
    const kleidi=/efarmoges\.json$/.test(u.pathname)?"./efarmoges.json":"./index.html";
    e.respondWith(fetch(r.mode==="navigate"?new Request(r.url,{cache:"reload",credentials:"same-origin"}):r).then(res=>{
      if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(kleidi,c)).catch(()=>{})}return res;
    }).catch(()=>caches.match(kleidi).then(x=>x||caches.match("./")).then(x=>x||Response.error())));
    return;
  }
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(y=>y.put(r,c)).catch(()=>{})}return res})));
});
