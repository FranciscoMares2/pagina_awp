const cacheName = "employee-manager-v1";
const assets = ["/", "/index.html", "/app.js", "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data.json(); 
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || "icon.png",
    badge: data.badge || "icon.png",
  });
});

