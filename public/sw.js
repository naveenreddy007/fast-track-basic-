const CACHE_NAME = 'fast-track-wash-v1';
const urlsToCache = [
  '/',
  '/admin',
  '/admin/login',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  '/locales/en/common.json',
  '/locales/ar/common.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event
self.addEventListener('push', function(event) {
  let notificationData = {
    title: 'Fast Track Wash',
    body: 'New Fast Track Booking! 🚗✨ Tap to view.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/admin'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.notification) {
        notificationData = {
          ...notificationData,
          ...pushData.notification
        };
      }
    } catch (e) {
      // Fallback to text data
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: notificationData.data,
    actions: [
      {
        action: 'explore',
        title: 'View Booking',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/admin';
  
  if (event.action === 'explore') {
    // Open the specified URL
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open specified URL
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});