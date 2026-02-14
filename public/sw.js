const CACHE_NAME = 'registrame-ya-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/favicon.ico',
    '/images/logo.png',
];

// Instalar el Service Worker y cachear recursos básicos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Estrategia de red con caída a cache (Network first, then cache)
// Esto asegura que siempre se vea la última versión si hay internet,
// pero funciona offline si no la hay.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
