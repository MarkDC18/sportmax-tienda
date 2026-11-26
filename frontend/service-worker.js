const CACHE = "sportmax-shell-v1"; // <-- CAMBIADO
const SHELL = ["/", "/index.html", "/manifest.json", "/css/styles.css",
  "/js/config.js", "/js/firebase-init.js", "/js/db.js", "/js/sync-manager.js", "/js/app.js",
  "/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match("/offline.html")) || new Response("Sin conexión", {status: 503});
    }
  })());
});