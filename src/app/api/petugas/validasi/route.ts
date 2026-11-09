// ========================================================================
// app/api/petugas/validasi/route.ts
// Route Handler Otorisasi Validasi Keberangkatan Tiket (Next.js App Router)
// Role Diizinkan: PETUGAS & ADMIN (RBAC Guard Server-Side)
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

/**
 * GET: Mencari detail tiket berdasarkan kode booking / NIK / ID tiket
 * Atau mengambil riwayat validasi hari ini (?action=history)
 */
export async function GET(request: Request) {
  try {
    // 1. Otorisasi Server-Side: Wajib Login & Memiliki Role PETUGAS atau ADMIN
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    if (!['PETUGAS', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak (403 Forbidden): Fitur ini khusus Petugas Gate dan Admin.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('q') || searchParams.get('code') || '';

    // A. Sub-Aksi: Ambil Riwayat Validasi Boarding Hari Ini
    if (action === 'history') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const boardedToday = await prisma.detailTiket.findMany({
        where: {
          statusTiket: 'BOARDED',
          createdAt: {
            gte: todayStart,
          },
        },
        include: {
          pemesanan: {
            select: {
              kodeBooking: true,
              statusPembayaran: true,
            },
          },
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
          kursi: {
            include: {
              gerbong: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        data: boardedToday,
      });
    }

    // B. Pencarian Kode Booking / Nomor Identitas Penumpang
    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Parameter kode booking atau nomor tiket wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanCode = query.trim().toUpperCase();

    const booking = await prisma.pemesanan.findFirst({
      where: {
        OR: [
          { kodeBooking: cleanCode },
          { id: query },
          {
            detailTiket: {
              some: {
                OR: [
                  { id: query },
                  { penumpangIdentitas: query },
                ],
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            phone: true,
          },
        },
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
        detailTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
          orderBy: {
            penumpangNama: 'asc',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Tiket dengan kode booking / identitas "${query}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (err: any) {
    console.error('Error GET /api/petugas/validasi:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan sistem di server.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Konfirmasi Check-In / Boarding Penumpang
 * Mengubah statusTiket menjadi 'BOARDED' di database PostgreSQL
 */
export async function POST(request: Request) {
  try {
    // 1. Otorisasi Server-Side: Verifikasi Role
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesi berakhir atau tidak terautentikasi.' },
        { status: 401 }
      );
    }

    if (!['PETUGAS', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak: Hanya Petugas Gate atau Admin yang dapat memvalidasi tiket.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { detailTiketId, kodeBooking, all } = body;

    if (!detailTiketId && !kodeBooking) {
      return NextResponse.json(
        { success: false, error: 'detailTiketId atau kodeBooking wajib disertakan.' },
        { status: 400 }
      );
    }

    // 2. Kasus A: Validasi Tiket Tunggal Penumpang (detailTiketId)
    if (detailTiketId) {
      const ticket = await prisma.detailTiket.findUnique({
        where: { id: detailTiketId },
        include: {
          pemesanan: true,
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: 'Data tiket tidak ditemukan di database.' },
          { status: 404 }
        );
      }

      // Validasi pembayaran: wajib PAID
      if (ticket.pemesanan.statusPembayaran !== 'PAID') {
        return NextResponse.json(
          {
            success: false,
            error: `Tiket belum lunas (status ${ticket.pemesanan.statusPembayaran}). Penumpang harus menyelesaikan pembayaran di loket sebelum boarding.`,
          },
          { status: 400 }
        );
      }

      if (ticket.statusTiket === 'BOARDED') {
        return NextResponse.json(
          { success: false, error: 'Penumpang ini sudah melakukan boarding sebelumnya.' },
          { status: 400 }
        );
      }

      const updated = await prisma.detailTiket.update({
        where: { id: detailTiketId },
        data: {
          statusTiket: 'BOARDED',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Penumpang ${updated.penumpangNama} berhasil check-in (BOARDED).`,
        data: updated,
      });
    }

    // 3. Kasus B: Validasi Rombongan Sekaligus dalam 1 Kode Booking
    if (kodeBooking && all) {
      const booking = await prisma.pemesanan.findUnique({
        where: { kodeBooking: kodeBooking.toUpperCase().trim() },
        include: { detailTiket: true },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Kode booking tidak ditemukan.' },
          { status: 404 }
        );
      }

      if (booking.statusPembayaran !== 'PAID') {
        return NextResponse.json(
          {
            success: false,
            error: `Pemesanan ini berstatus ${booking.statusPembayaran}. Boarding ditolak karena belum lunas.`,
          },
          { status: 400 }
        );
      }

      const updatedBatch = await prisma.detailTiket.updateMany({
        where: {
          pemesananId: booking.id,
          statusTiket: 'BOOKED',
        },
        data: {
          statusTiket: 'BOARDED',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil check-in ${updatedBatch.count} penumpang untuk kode booking ${booking.kodeBooking}.`,
        count: updatedBatch.count,
      });
    }

    return NextResponse.json({ success: false, error: 'Parameter permintaan tidak valid.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error POST /api/petugas/validasi:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memproses validasi tiket di database.' },
      { status: 500 }
    );
  }
}