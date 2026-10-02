// PANDIRSTORE.ID - Service Worker (PWA)
const CACHE_NAME = 'pandirstore-pwa-v3';

// If running in development, preview environment (*.run.app), or localhost:
// Self-destruct immediately to prevent iframe preview hanging and avoid caching dev server assets.
const isDevPreview =
  self.location.hostname.includes('run.app') ||
  self.location.hostname.includes('localhost') ||
  self.location.hostname === '127.0.0.1';

if (isDevPreview) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });
  // In dev / preview, NO fetch interceptor is attached so network flows directly to dev server.
} else {
  // Production PWA (Netlify / Custom Production Domains)
  const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pandirstore-logo.svg',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/apple-touch-icon.png',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((name) => {
              if (name !== CACHE_NAME) {
                return caches.delete(name);
              }
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    // SPA Navigation requests: network-first, fallback to cache
    // Note: Do NOT mutate request options (like cache: 'no-cache') in iOS Safari!
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            return caches.match('/index.html').then((cached) => cached || caches.match('/'));
          })
      );
      return;
    }

    // Static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse;
          });
      })
    );
  });
}
