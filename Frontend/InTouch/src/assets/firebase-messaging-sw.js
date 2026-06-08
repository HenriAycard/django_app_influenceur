/* Firebase Cloud Messaging service worker — handles background (app closed /
 * tab not focused) push notifications. Served from /assets and registered
 * explicitly by AppComponent, which passes this registration to getToken().
 *
 * The SW cannot read Angular's environment, so the Firebase web config is
 * inlined here (it mirrors src/environments/environment*.ts). These values are
 * public client config, not secrets. */
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCKz2qmHE-rlKL6D_i1QzsDZmiPf4iAPBE',
  authDomain: 'intouch-11c77.firebaseapp.com',
  projectId: 'intouch-11c77',
  storageBucket: 'intouch-11c77.firebasestorage.app',
  messagingSenderId: '910943793771',
  appId: '1:910943793771:web:4785ee153f8cd2f8f9772e',
  measurementId: 'G-90J50S1J17',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || 'InTouch', {
    body: notification.body || '',
    icon: '/assets/icon/favicon.png',
    badge: '/assets/icon/favicon.png',
    data: payload.data || {},
  });
});

// Focus/open the app when the user taps the notification.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
