// src/app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// Helper membuat Kode Booking acak 6-8 karakter (Contoh: KAI-8B2XZ)
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'KAI-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jadwalId, totalBayar, penumpang, kontak } = body;

    if (!jadwalId || !penumpang || penumpang.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data pemesanan tidak lengkap.' },
        { status: 400 }
      );
    }

    // 1. Tentukan User ID (Gunakan user yang sedang login, atau fallback ke user demo)
    const sessionUser = await getSessionUser();
    let userId = sessionUser?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst({
        where: { role: 'PENUMPANG' },
      });

      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            nama: penumpang[0]?.nama || 'Penumpang KAI',
            email: kontak?.email || `penumpang_${Date.now()}@gmail.com`,
            phone: kontak?.phone || '081234567890',
            passwordHash: 'dummy_hash',
            role: 'PENUMPANG',
          },
        });
        userId = newUser.id;
      }
    }

    // 2. Buat Kode Booking Unik
    const kodeBooking = generateBookingCode();

    // 3. Ambil salah satu kursi dari database (atau fallback ID kursi valid)
    const existingKursi = await prisma.kursi.findFirst();
    const fallbackKursiId = existingKursi?.id;

    // 4. Eksekusi Transaksi Atomic di Supabase: Tabel Pemesanan + Tabel DetailTiket
    const newBooking = await prisma.pemesanan.create({
      data: {
        kodeBooking,
        userId: userId,
        jadwalId: jadwalId,
        statusPembayaran: 'PAID', // Otomatis lunas agar langsung muncul di Portal Petugas
        totalBayar: Number(totalBayar) || 550000,
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Berlaku 2 jam
        detailTiket: {
          create: penumpang.map((p: any) => ({
            jadwalId: jadwalId,
            penumpangNama: p.nama,
            penumpangIdentitas: p.identitas,
            kursiId: fallbackKursiId || 'd1000000-0000-0000-0000-000000000001',
            statusTiket: 'BOOKED',
          })),
        },
      },
      include: {
        detailTiket: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pemesanan berhasil disimpan ke database Supabase!',
      kodeBooking: newBooking.kodeBooking,
      booking: newBooking,
    });
  } catch (error: any) {
    console.error('[API BOOKING POST ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan transaksi ke database Supabase.',
      },
      { status: 500 }
    );
  }
}