
const CACHE_NAME = 'secnto-cache-v2'; // <<<< CHANGED FROM v1 to v2
const ESSENTIAL_LOCAL_URLS = [
  '/',
  '/index.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];
const CDN_URLS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com', // Base domain for fonts
  'https://fonts.gstatic.com', // Base domain for fonts
  'https://esm.sh' // Base domain for esm.sh modules
];
// manifest.json is linked in HTML, browser will fetch it.
// Service worker focuses on app shell and critical assets for offline experience.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching initial essential assets');
        // Cache essential local assets first
        const localAssetRequests = ESSENTIAL_LOCAL_URLS.map(url => new Request(url, { mode: 'same-origin' }));
        return cache.addAll(localAssetRequests)
          .then(() => {
            console.log('Essential local assets cached. Attempting to cache CDN assets.');
            // Attempt to cache CDN assets with 'cors' mode, but don't let failures block installation
            const cdnRequests = CDN_URLS.flatMap(url => {
              // Create specific requests for known full URLs if needed, or handle base URLs in fetch
              if (url === 'https://fonts.googleapis.com') {
                return [
                    new Request('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap', { mode: 'cors'}),
                ];
              } else if (url === 'https://esm.sh') {
                  // Add known esm.sh URLs used in importmap
                  // This list should be maintained if importmap changes
                  return [
                      new Request('https://esm.sh/react@^19.1.0', { mode: 'cors' }),
                      new Request('https://esm.sh/react-dom@^19.1.0/client', { mode: 'cors' }), // Corrected path for client
                      new Request('https://esm.sh/@google/genai@^1.1.0', { mode: 'cors' }),
                      new Request('https://esm.sh/firebase@^11.8.1/compat/app', { mode: 'cors' }), // Correct path for compat/app
                      new Request('https://esm.sh/firebase@^11.8.1/compat/auth', { mode: 'cors' }), // Correct path for compat/auth
                  ];
              } else if (url === 'https://cdn.tailwindcss.com') {
                  return [new Request(url, {mode: 'cors'})];
              }
              return []; // Fallback for other CDN_URLS if not specifically handled
            });
            return Promise.all(
              cdnRequests.map(req =>
                cache.add(req).catch(err => console.warn(`Failed to cache CDN resource: ${req.url}`, err))
              )
            );
          });
      })
      .catch(err => {
        console.error('Failed to cache essential assets during install:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null; // Added to satisfy map return type if condition not met
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Network-first for root and index.html navigation requests
  if (event.request.mode === 'navigate' && (requestUrl.pathname === '/' || requestUrl.pathname.endsWith('/index.html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // Fallback to a generic offline page if available and appropriate
            // return caches.match('/offline.html'); 
            // If index.html itself can't be fetched and isn't in cache, this will lead to browser's default error.
            return new Response("Network error: Unable to load the page.", { status: 503, statusText: "Service Unavailable", headers: { 'Content-Type': 'text/plain' }});
          });
        })
    );
  }
  // Cache-first for other specific essential local assets (icons)
  else if (ESSENTIAL_LOCAL_URLS.some(url => requestUrl.pathname.endsWith(url) && url !== '/' && url !== '/index.html')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            (networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            }
          ).catch(error => {
            console.warn('Fetch failed for essential local asset (icon):', event.request.url, error);
            // For icons, failing might just result in a missing image, not a page load error.
            return new Response('', {status: 404, statusText: 'Not Found'});
          });
        })
    );
  }
  // Stale-while-revalidate for CDN assets
  else if (CDN_URLS.some(cdnBaseUrl => requestUrl.hostname === new URL(cdnBaseUrl).hostname )) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchedResponsePromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) { // Only cache successful responses
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
          console.warn(`Failed to fetch CDN resource from network: ${event.request.url}`, err);
          // If fetch fails, and we have a cached response, it will be returned by "cachedResponse || fetchedResponsePromise"
          // If no cachedResponse, this error will propagate, leading to browser default handling for failed resource.
          if (!cachedResponse) throw err; // Re-throw if no cache fallback
        });

        return cachedResponse || fetchedResponsePromise;
      })
    );
  }
  // Network-first, then Cache for other same-origin requests (like .tsx modules, .js, .css not covered above)
  else if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
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
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            console.warn(`Network failed and no cache for same-origin: ${event.request.url}`);
            // This path means a local module (like a .tsx file) failed to load from network and isn't in cache.
            // This will likely result in the "moved, edited, or deleted" error for that module.
            return new Response(`Resource not found: ${requestUrl.pathname}`, { status: 404, statusText: "Not Found", headers: { 'Content-Type': 'text/plain' }});
          });
        })
    );
  }
  // Default: just fetch (for cross-origin API calls like Gemini, etc., which shouldn't be cached by SW)
  else {
    event.respondWith(fetch(event.request));
  }
});
