const CACHE_NAME = 'boda-cache-v1';

// Al instalar, no guardamos archivos críticos para no afectar actualizaciones
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Estrategia Network-First (Intenta descargar siempre, si falla, usa caché)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guarda una copia en cache de lo descargado exitosamente
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Si falla el internet, intenta buscarlo en cache
                return caches.match(event.request);
            })
    );
});
