import { NextResponse } from 'next/server';
import { runCancelExpiredBookings } from '@/workers/expiredBookingWorker';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Opsional: Validasi Token Rahasia Cron agar tidak sembarang orang bisa memanggil
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCancelExpiredBookings();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}