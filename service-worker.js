const ROOT = "/self-jorei-dev/";  // ← あなたのリポジトリ名に変更

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        ROOT,
        ROOT + "index.html",
        ROOT + "mantra.html",
        ROOT + "mantra.css",
        ROOT + "script.js",
        ROOT + "mantra.js",
        ROOT + "light_particles.js",
        ROOT + "mantra.json",
        ROOT + "mantra_long.json",
        ROOT + "ic_back.png"
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