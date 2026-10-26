/* Keeps Simple demo working offline after the first visit.
   It always tries the internet first, so updates show up right away,
   and falls back to the saved copy when offline. */
const CACHE = "simple-demo-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "config.js", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || e.request.url.includes(".supabase.co")) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
});
