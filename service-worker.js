"use strict";

const cacheName = "hanzi-trainer-static-v6";
const cachedFiles = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(cachedFiles))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(cacheNames
        .filter(existingName => existingName.startsWith("hanzi-trainer-static-") && existingName !== cacheName)
        .map(existingName => caches.delete(existingName))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestedUrl = new URL(event.request.url);
  if (requestedUrl.origin !== self.location.origin || !requestedUrl.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(
    (event.request.mode === "navigate"
      ? fetch(event.request).then(networkResponse => {
          const responseCopy = networkResponse.clone();
          caches.open(cacheName).then(cache => cache.put(event.request, responseCopy));
          return networkResponse;
        }).catch(() => caches.match(event.request).then(response => response || caches.match("./index.html")))
      : caches.match(event.request).then(cachedResponse => cachedResponse || fetch(event.request)))
  );
});
