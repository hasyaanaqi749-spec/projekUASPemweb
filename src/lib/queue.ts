import 'dotenv/config'; 
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// 1. Tipe data isi antrean (Job Data)
export interface PushJobPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type?: 'PAYMENT_SUCCESS' | 'BOOKING_CANCELLED' | 'SCHEDULE_REMINDER';
}

const QUEUE_NAME = 'push-notification-queue';
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 2. Setup Redis Connection dengan ioredis (mendukung TLS Upstash rediss://)
const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

// 3. Singleton Pattern agar Next.js tidak membuka koneksi berulang kali di mode dev
declare global {
  var __pushQueueInstance: Queue<PushJobPayload> | undefined;
}

export const pushQueue: Queue<PushJobPayload> =
  globalThis.__pushQueueInstance ||
  new Queue(QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3, // Coba ulang maksimal 3 kali jika gagal
      backoff: {
        type: 'exponential',
        delay: 2000, // Tunggu 2s, 4s, 8s sebelum mencoba lagi
      },
      removeOnComplete: { count: 100 }, // Simpan 100 histori job sukses terakhir
      removeOnFail: { count: 50 },     // Simpan 50 histori job gagal terakhir
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pushQueueInstance = pushQueue;
}

// ============================================================================
// 4. HELPER FUNCTIONS: Panggil fungsi ini dari Server Action atau Route Handler
// ============================================================================

/**
 * Kirim notifikasi saat tiket berhasil dibayar
 */
export async function dispatchPaymentSuccessPush(userId: string, kodeBooking: string, nominal: number) {
  return await pushQueue.add('send-push', {
    userId,
    title: 'Pembayaran Tiket Berhasil! 🚆',
    body: `Tiket ${kodeBooking} sebesar Rp ${nominal.toLocaleString('id-ID')} telah lunas. Selamat menikmati perjalanan!`,
    icon: '/kai-icon.png',
    url: `/tiket/${kodeBooking}`,
    type: 'PAYMENT_SUCCESS',
  });
}

/**
 * Kirim notifikasi saat tiket dibatalkan otomatis karena lewat 15 menit
 */
export async function dispatchBookingCancelledPush(userId: string, kodeBooking: string) {
  return await pushQueue.add('send-push', {
    userId,
    title: 'Batas Waktu Pembayaran Habis ⚠️',
    body: `Pemesanan tiket ${kodeBooking} dibatalkan otomatis karena melewati 15 menit. Kursi telah dilepaskan.`,
    icon: '/kai-icon.png',
    url: '/jadwal',
    type: 'BOOKING_CANCELLED',
  });
}

/**
 * Kirim notifikasi pengingat keberangkatan kereta (H-2 Jam)
 */
export async function dispatchScheduleReminderPush(userId: string, namaKereta: string, jamBerangkat: string) {
  return await pushQueue.add('send-push', {
    userId,
    title: 'Pengingat Keberangkatan Kereta ⏰',
    body: `Kereta ${namaKereta} Anda dijadwalkan berangkat pukul ${jamBerangkat}. Harap tiba di stasiun 30 menit sebelumnya.`,
    icon: '/kai-icon.png',
    type: 'SCHEDULE_REMINDER',
  });
}