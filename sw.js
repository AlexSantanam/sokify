/**
 * Zokify Service Worker (PWA)
 * Soporta instalación en PC de escritorio (Windows, Mac, Linux) y móviles.
 */
const CACHE_NAME = 'sokify-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/panel.html',
  '/index.html',
  '/cocina.html',
  '/menu.html',
  '/config.js',
  '/firebase-config.js',
  '/firebase-init.js',
  '/manifest.json',
  '/assets/favicon.png',
  '/assets/zokify-avatar.png',
  '/assets/zokify-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Intentar almacenar en caché los activos estáticos principales
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Cache addAll parcial:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET o que sean de extensiones / Firebase en vivo
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // No interceptar peticiones de Firestore o Google APIs para mantener datos en tiempo real siempre frescos
  if (url.origin.includes('firestore.googleapis.com') ||
      url.origin.includes('identitytoolkit.googleapis.com') ||
      url.origin.includes('firebaseio.com') ||
      url.origin.includes('gstatic.com') ||
      url.origin.includes('google-analytics.com')) {
    return;
  }

  // Network First con fallback a Cache para que los datos siempre estén actualizados
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Si es navegación HTML, retornar panel.html como fallback offline
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/panel.html');
          }
        });
      })
  );
});
