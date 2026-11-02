import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Konfigurasi VAPID untuk Web Push Notification
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@kai.ac.id',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * 1. WORKER: Membatalkan tiket PENDING yang melewati 15 menit
 * Kursi otomatis terbebas karena status pemesanan berubah menjadi CANCELLED
 */
export async function runCancelExpiredBookings() {
  const now = new Date();

  // Cari semua pemesanan PENDING yang waktu expiredAt-nya sudah lewat
  const expiredList = await prisma.pemesanan.findMany({
    where: {
      statusPembayaran: 'PENDING',
      expiredAt: {
        lt: now, // lt = less than (kurang dari waktu sekarang)
      },
    },
    select: {
      id: true,
      kodeBooking: true,
      userId: true,
    },
  });

  if (expiredList.length === 0) {
    return { cancelledCount: 0 };
  }

  // Batalkan seluruh tiket expired secara atomic
  for (const item of expiredList) {
    await prisma.pemesanan.update({
      where: { id: item.id },
      data: {
        statusPembayaran: 'CANCELLED',
        updatedAt: now,
      },
    });

    // Kirim Web Push Notification ke HP/Laptop user
    await notifyUserBookingCancelled(item.userId, item.kodeBooking);
  }

  return { cancelledCount: expiredList.length };
}

/**
 * 2. Mengirim Web Push Notification ke browser penumpang
 */
async function notifyUserBookingCancelled(userId: string, kodeBooking: string) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const payload = JSON.stringify({
      title: 'Batas Pembayaran Berakhir',
      body: `Pemesanan ${kodeBooking} dibatalkan otomatis karena melewati 15 menit. Kursi telah dilepaskan kembali.`,
      icon: '/icon.png',
    });

    for (const sub of subscriptions) {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keysP256dh,
            auth: sub.keysAuth,
          },
        },
        payload
      );
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
}