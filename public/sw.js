// Minimal Service Worker for PWA installation
const CACHE_NAME = 'aga-pwa-cache-v2';
const URLS_TO_CACHE = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // PERFORMANCE & STABILITY:
  // Bypass cache for navigation requests to avoid "redirected response" errors
  // with Next.js/Supabase middleware redirections.
  if (event.request.mode === 'navigate') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
