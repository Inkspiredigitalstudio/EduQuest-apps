importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'sppi-quest-v3';

if (self.workbox) {
  console.log('[Workbox] Service Worker loaded successfully.');

  workbox.core.setCacheNameDetails({
    prefix: 'sppi-quest',
    suffix: 'v3',
    precache: 'app-shell',
    runtime: 'runtime',
  });

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. Precache Core App Shell Assets
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: 'v3' },
    { url: '/index.html', revision: 'v3' },
    { url: '/manifest.json', revision: 'v3' },
    { url: '/icon.svg', revision: 'v3' },
  ]);

  // 2. Cache HTML/SPA Page Navigations (NetworkFirst -> Cache)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'sppi-quest-pages',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // 3. Cache Exam Data, Supabase REST API & JSON Queries (NetworkFirst -> Cache Fallback)
  workbox.routing.registerRoute(
    ({ url }) =>
      url.pathname.includes('/rest/v1/') ||
      url.pathname.includes('/api/') ||
      url.pathname.endsWith('.json'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'sppi-quest-exam-data',
      networkTimeoutSeconds: 4,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days offline availability
        }),
      ],
    })
  );

  // 4. Cache JS Scripts, CSS Stylesheets, and Web Workers (StaleWhileRevalidate)
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'worker',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'sppi-quest-assets',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // 5. Cache Images, Audio SFX, and Web Fonts (CacheFirst)
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'audio',
    new workbox.strategies.CacheFirst({
      cacheName: 'sppi-quest-media',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        }),
      ],
    })
  );

  // Catch-all handler for offline navigation fallback
  workbox.routing.setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match('/index.html');
    }
    return Response.error();
  });
} else {
  // Custom Service Worker Fallback if Workbox fails to load (e.g. initial offline boot)
  console.log('[SW] Workbox CDN unreachable. Running standard offline cache fallback.');

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(['/', '/index.html', '/manifest.json', '/icon.svg']);
      }).then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request)
            .then((res) => {
              if (res && res.status === 200) {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
              }
              return res;
            })
            .catch(() => caches.match('/index.html'))
        );
      })
    );
  });
}
