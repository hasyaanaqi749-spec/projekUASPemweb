'use server';

import { prisma } from '@/lib/prisma';

// 1. Ambil Data Real-time dari Supabase
export async function getAdminDataAction() {
  try {
    const [dbJadwal, dbBookings, totalUser] = await Promise.all([
      prisma.jadwal.findMany({
        include: {
          kereta: true,
          rute: { include: { stasiunAsal: true, stasiunTujuan: true } },
        },
      }),
      prisma.pemesanan.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { nama: true, email: true } },
          jadwal: {
            include: {
              kereta: true,
              rute: { include: { stasiunAsal: true, stasiunTujuan: true } },
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      success: true,
      jadwal: dbJadwal,
      bookings: dbBookings,
      totalUser,
    };
  } catch (error: any) {
    console.error('Error getAdminDataAction:', error);
    return { success: false, error: error.message };
  }
}

// 2. Simpan Pemesanan Baru Langsung ke Tabel Supabase
export async function createAdminBookingAction(data: {
  penumpangNama: string;
  penumpangEmail: string;
  totalBayar: number;
  statusPembayaran: 'PAID' | 'PENDING';
}) {
  try {
    // A. Cari atau buat user penumpang jika belum ada
    let user = await prisma.user.findUnique({
      where: { email: data.penumpangEmail.toLowerCase().trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          nama: data.penumpangNama,
          email: data.penumpangEmail.toLowerCase().trim(),
          passwordHash: 'user123',
          role: 'PENUMPANG',
          phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
        },
      });
    }

    // B. Ambil salah satu jadwal aktif di database
    let jadwal = await prisma.jadwal.findFirst();
    if (!jadwal) {
      throw new Error('Belum ada jadwal kereta di database. Silakan buat jadwal terlebih dahulu.');
    }

    // C. Buat kode booking unik
    const kodeBooking = `KAI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // D. INSERT KE TABEL PEMESANAN SUPABASE
    const newBooking = await prisma.pemesanan.create({
      data: {
        kodeBooking,
        userId: user.id,
        jadwalId: jadwal.id,
        statusPembayaran: data.statusPembayaran,
        totalBayar: data.totalBayar,
        expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
      },
    });

    return { success: true, data: newBooking };
  } catch (error: any) {
    console.error('Error createAdminBookingAction:', error);
    return { success: false, error: error.message };
  }
}

// 3. Update Status (PAID / CANCELLED) di Supabase
export async function updateBookingStatusAction(id: string, newStatus: 'PAID' | 'CANCELLED') {
  try {
    await prisma.pemesanan.update({
      where: { id },
      data: { statusPembayaran: newStatus },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Hapus Pemesanan dari Supabase
export async function deleteBookingAction(id: string) {
  try {
    await prisma.pemesanan.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}