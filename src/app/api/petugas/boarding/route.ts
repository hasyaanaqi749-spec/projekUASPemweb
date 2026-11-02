import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 🛡️ Guard: Boleh diakses PETUGAS atau ADMIN
    await requireRole(['PETUGAS', 'ADMIN']);

    const { tiketId } = await req.json();
    const updated = await prisma.detailTiket.update({
      where: { id: tiketId },
      data: { statusTiket: 'BOARDED' },
    });

    return NextResponse.json({ success: true, message: 'Penumpang berhasil boarding!', data: updated });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Petugas yang berwenang.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Gagal memvalidasi tiket.' }, { status: 500 });
  }
}