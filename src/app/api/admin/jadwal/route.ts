import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 🛡️ Guard: Hanya ADMIN yang boleh membuat jadwal
    await requireRole(['ADMIN']);

    const body = await req.json();
    const jadwal = await prisma.jadwal.create({
      data: {
        keretaId: body.keretaId,
        ruteId: body.ruteId,
        waktuBerangkat: new Date(body.waktuBerangkat),
        waktuTiba: new Date(body.waktuTiba),
      },
    });

    return NextResponse.json({ success: true, data: jadwal });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Admin yang diizinkan.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Gagal membuat jadwal.' }, { status: 500 });
  }
}