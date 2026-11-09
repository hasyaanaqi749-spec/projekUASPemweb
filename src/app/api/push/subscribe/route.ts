// src/app/api/push/subscribe/route.ts
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Route Handler: Menyimpan Web Push Subscription Token ke Supabase
// ========================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Payload Push Subscription tidak lengkap.' },
        { status: 400 }
      );
    }

    // Ambil data user yang sedang login (jika ada sesi)
    const sessionUser = await getSessionUser();
    
    // Jika tidak ada user login, gunakan akun penumpang demo default
    const userId = sessionUser?.id || '33333333-3333-3333-3333-333333333333';

    // Simpan atau perbarui subscription di tabel push_subscriptions Supabase
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: userId,
          endpoint: endpoint,
        },
      },
      update: {
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
        userAgent: userAgent || 'Browser Web Client',
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        endpoint: endpoint,
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
        userAgent: userAgent || 'Browser Web Client',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Web Push Subscription berhasil didaftarkan.',
      id: subscription.id,
    });
  } catch (error: any) {
    console.error('[API PUSH SUBSCRIBE ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan subscription notifikasi.',
      },
      { status: 500 }
    );
  }
}