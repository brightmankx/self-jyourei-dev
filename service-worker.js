self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/mantra.html",
        "/mantra.css",
        "/script.js",
        "/mantra.js",
        "/light_particles.js",
        "/mantra.json",
        "/mantra_long.json",
        "/ic_back.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});