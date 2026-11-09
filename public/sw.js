// public/sw.js
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Service Worker: Background Web Push Notification & Click Handler
// ========================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Informasi terbaru tentang perjalanan kereta Anda.',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      vibrate: [100, 50, 100],
      data: data.data || { url: '/' },
      actions: [
        { action: 'open_url', title: 'Buka Tiket' },
        { action: 'close', title: 'Tutup' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notifikasi Tiket Kereta Api', options)
    );
  } catch (error) {
    console.error('[SW] Gagal menampilkan push notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Jika browser tab sudah terbuka, bawa ke depan (focus)
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika belum terbuka, buka window / tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});