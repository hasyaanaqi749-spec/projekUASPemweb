import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 1. Pastikan pengguna login
    const user = await requireAuth();

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Payload PushSubscription tidak lengkap.' },
        { status: 400 }
      );
    }

    // 2. Simpan atau perbarui subscription (UPSERT)
    // Menggunakan composite unique (userId, endpoint) yang sudah kita rancang di schema.prisma
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint,
        },
      },
      update: {
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
        userAgent: userAgent || 'Browser',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint,
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
        userAgent: userAgent || 'Browser',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Perangkat berhasil terdaftar untuk Web Push Notification.',
      id: subscription.id,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }
    console.error('[PUSH SUBSCRIBE ERROR]:', error);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan Web Push Notification.' },
      { status: 500 }
    );
  }
}