import 'dotenv/config'; // Pastikan ini di baris paling pertama!
import { Worker } from 'bullmq';
import webpush from 'web-push';
import { prisma } from '../lib/prisma';
import IORedis from 'ioredis';

// Cek apakah REDIS_URL terbaca
console.log('Connecting to Redis URL:', process.env.REDIS_URL ? 'URL Terdeteksi ✅' : 'URL KOSONG ❌ (Cek .env)');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 1. Inisialisasi koneksi Redis dengan ioredis (support Upstash rediss://)
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  keepAlive: 10000,
  enableReadyCheck: false, // <-- Tambahkan ini untuk Upstash Redis
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

connection.on('connect', () => {
  console.log('✅ Berhasil terhubung ke Upstash Redis!');
});

connection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});

// 2. Konfigurasi VAPID dengan fallback
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@lajurel.com',
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('🔑 VAPID Keys Web Push terverifikasi ✅');
} else {
  console.warn('⚠️ PERINGATAN: VAPID keys belum diatur di file .env');
}

// 3. Worker BullMQ
export const pushWorker = new Worker(
  'push-notification-queue',
  async (job) => {
    console.log(`[Worker] 🔄 Memproses job: ${job.name} (ID: ${job.id})`);
    const { userId, title, body, icon } = job.data;

    // Ambil subscription user dari PostgreSQL Supabase
    const subs = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subs.length === 0) {
      console.log(`[Worker] ℹ️ Tidak ada push subscription terdaftar untuk user ${userId} (User belum allow notifikasi di browser)`);
      return { sent: 0 };
    }

    const payload = JSON.stringify({
      title: title || 'Notifikasi Tiket KAI',
      body: body || 'Ada pembaruan status tiket Anda.',
      icon: icon || '/kai-icon.png',
    });

    let successCount = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
          },
          payload
        );
        successCount++;
      } catch (err: any) {
        // Jika browser sudah unsub / token expired (status 410 Gone / 404), hapus dari DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.warn(`[Worker] 🗑️ Menghapus subscription mati dari database ID: ${sub.id}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error(`[Worker] ⚠️ Gagal kirim push ke ${sub.id}:`, err.message);
        }
      }
    }

    return { sent: successCount };
  },
  { connection }
);

// 4. Log status job
pushWorker.on('completed', (job, result) => {
  console.log(`✅ [Worker] Selesai: Job ${job.id} (${job.name}) terkirim ke ${result?.sent || 0} perangkat.`);
});

pushWorker.on('failed', (job, err) => {
  console.error(`❌ [Worker] Gagal: Job ${job?.id} mengalami error:`, err.message);
});

console.log('🚀 Background Worker (BullMQ + Redis) aktif dan siap memproses notifikasi...');

// 5. Graceful shutdown saat tekan Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n🛑 Menghentikan worker secara aman...');
  await pushWorker.close();
  await connection.quit();
  process.exit(0);
});