// src/app/api/admin/route.ts
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Route Handler: Data Dashboard Admin & Pengubah Status Pembayaran
// ========================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Ambil seluruh data pemesanan & kalkulasi statistik Supabase
export async function GET() {
  try {
    const bookings = await prisma.pemesanan.findMany({
      include: {
        user: true,
        jadwal: {
          include: {
            kereta: true,
            rute: {
              include: {
                stasiunAsal: true,
                stasiunTujuan: true,
              },
            },
          },
        },
        detailTiket: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Hitung ringkasan statistik
    const totalPesanan = bookings.length;
    const pendingCount = bookings.filter((b) => b.statusPembayaran === 'PENDING').length;
    const paidCount = bookings.filter((b) => b.statusPembayaran === 'PAID').length;
    const totalPendapatan = bookings
      .filter((b) => b.statusPembayaran === 'PAID')
      .reduce((acc, curr) => acc + Number(curr.totalBayar), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalPesanan,
        pendingCount,
        paidCount,
        totalPendapatan,
      },
      bookings: bookings.map((b) => ({
        id: b.id,
        kodeBooking: b.kodeBooking,
        pemesanNama: b.user?.nama || 'Penumpang KAI',
        pemesanEmail: b.user?.email || 'user@example.com',
        namaKereta: b.jadwal?.kereta?.namaKereta || 'Taksaka Malam',
        rute: b.jadwal?.rute
          ? `${b.jadwal.rute.stasiunAsal.kodeStasiun} → ${b.jadwal.rute.stasiunTujuan.kodeStasiun}`
          : 'GMR → YK',
        totalBayar: Number(b.totalBayar),
        statusPembayaran: b.statusPembayaran,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[API ADMIN GET ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dari database Supabase.' },
      { status: 500 }
    );
  }
}

// 2. PATCH: Mengubah status pembayaran (misal: Ubah ke PAID)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { kodeBooking, statusPembayaran } = body;

    if (!kodeBooking) {
      return NextResponse.json({ error: 'Kode booking wajib diisi.' }, { status: 400 });
    }

    const updated = await prisma.pemesanan.update({
      where: { kodeBooking },
      data: {
        statusPembayaran: statusPembayaran || 'PAID',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tiket ${kodeBooking} berhasil diubah ke ${statusPembayaran || 'PAID'}!`,
      booking: updated,
    });
  } catch (error: any) {
    console.error('[API ADMIN PATCH ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mengubah status pembayaran.' }, { status: 500 });
  }
}