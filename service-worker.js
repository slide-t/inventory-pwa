// sw.js - Service Worker

self.addEventListener('install', event => {
    console.log('Service Worker installed.');
    self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated.');
    return self.clients.claim();
});

// Listen for messages from main page
self.addEventListener('message', event => {
    if(event.data && event.data.type === 'LOW_STOCK_ALERT'){
        const itemName = event.data.itemName;
        const quantity = event.data.quantity;
        self.registration.showNotification('Low Stock Alert', {
            body: `${itemName} has only ${quantity} left!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/833/833314.png', // optional icon
            tag: 'low-stock'
        });
    }
});

// Optional: handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if(clientList.length > 0){
                clientList[0].focus();
            } else {
                clients.openWindow('/');
            }
        })
    );
});
