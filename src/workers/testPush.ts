import 'dotenv/config';
import { pushQueue } from '../lib/queue';

async function testKirimJob() {
  console.log('Mengirim job simulasi ke antrean Redis...');

  const job = await pushQueue.add('send-push', {
    userId: 'user-demo-123',
    title: 'Tiket Berhasil Dipesan! 🚆',
    body: 'Kode Booking: KAI-DEMO-999. Segera lakukan pembayaran sebelum 15 menit.',
    icon: '/kai-icon.png',
  });

  console.log(`✅ Job berhasil masuk antrean! Job ID: ${job.id}`);
  process.exit(0);
}

testKirimJob();