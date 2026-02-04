// Service Worker for BountyHub PWA
const CACHE_NAME = 'bountyhub-v1.0.1'
const RUNTIME_CACHE = 'bountyhub-runtime-v1.0.1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.svg',
  '/favicon.ico',
  '/manifest.json'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
    .then(() => self.clients.claim())
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Navigation requests (SPA): network-first so refresh after deploy gets fresh index.html and correct chunk URLs.
  // Cache fallback only when offline to avoid serving stale HTML that references deleted assets (ERR_FAILED on refresh).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone))
          }
          return response
        })
        .catch(() => caches.match('/index.html'))
        .then((response) => response || new Response('', { status: 503, statusText: 'Service Unavailable' }))
    )
    return
  }

  // API requests - network only
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return offline response for API calls
          return new Response(
            JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          )
        })
    )
    return
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
  )
})

// Background sync for offline actions (if needed in future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(
      // Handle offline actions here
      Promise.resolve()
    )
  }
})

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'BountyHub'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: data.url || '/',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})

