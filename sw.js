// sw.js - Service Worker
const CACHE_NAME = 'inventory-pwa-v4';
const FILES_TO_CACHE = [
  '/',
  '/store.html',
  '/admin.html',
  '/style.css',       // if you separate CSS
  '/app.js',          // your main JS
  '/sw.js',
  'https://unpkg.com/dexie/dist/dexie.js',
  'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached first, then network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    }).catch(() => {
      // Optional: fallback page if offline
      if (event.request.mode === 'navigate') {
        return caches.match('/store.html');
      }
    })
  );
});

// Listen for messages from admin PWA for notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LOW_STOCK_ALERT') {
    self.registration.showNotification('Low Stock Alert', {
      body: `${event.data.itemName} has only ${event.data.quantity} left!`,
      icon: '/icon.png', // optional icon
    });
  }
});
