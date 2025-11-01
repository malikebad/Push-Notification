// Service Worker for Web Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: {
          url: data.url,
          campaignId: data.campaignId,
        },
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
    }
  );

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const campaignId = event.notification.data?.campaignId;

  // Track click event
  if (campaignId) {
    fetch(`/api/campaigns/${campaignId}/click`, {
      method: 'POST',
    }).catch(err => console.error('Failed to track click:', err));
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed');
  // Handle subscription change if needed
});
