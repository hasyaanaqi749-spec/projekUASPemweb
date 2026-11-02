'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

// Tipe data input untuk penumpang yang memesan
export interface PassengerInput {
  nama: string;
  identitas: string; // NIK KTP (16 digit) / No. Paspor
  kursiId: string;   // UUID kursi yang dipilih
}

export interface CreateBookingInput {
  jadwalId: string;
  penumpangList: PassengerInput[];
}

export interface BookingResponse {
  success: boolean;
  kodeBooking?: string;
  totalBayar?: number;
  expiredAt?: string;
  error?: string;
}

/**
 * Generator Kode Booking Unik (Contoh format: KAI-7F9X2B)
 */
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa huruf ambigu seperti O/0, I/1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `KAI-${code}`;
}

/**
 * CORE LOGIC: TRANSAKSI PEMESANAN TIKET KERETA API
 */
export async function createBookingAction(input: CreateBookingInput): Promise<BookingResponse> {
  const { jadwalId, penumpangList } = input;

  try {
    // ========================================================================
    // LAPISAN 1: VALIDASI HAK AKSES & PENGGUNA LOGIN
    // ========================================================================
    const currentUser = await requireAuth(); // Membaca session dari HTTP-Only Cookie
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    // Validasi daftar penumpang tidak boleh kosong
    if (!penumpangList || penumpangList.length === 0) {
      return { success: false, error: 'Minimal harus memesan 1 tiket penumpang.' };
    }
    if (penumpangList.length > 4) {
      return { success: false, error: 'Maksimal pemesanan adalah 4 tiket dalam satu transaksi.' };
    }

    // Cegah duplikasi kursi dalam satu form pemesanan yang sama
    const uniqueSeatIds = new Set(penumpangList.map((p) => p.kursiId));
    if (uniqueSeatIds.size !== penumpangList.length) {
      return { success: false, error: 'Terdapat kursi ganda pada daftar penumpang yang Anda pilih.' };
    }

    // ========================================================================
    // LAPISAN 2: VALIDASI JADWAL, KERETA & TARIF
    // ========================================================================
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
      include: {
        kereta: true,
        rute: {
          include: {
            stasiunAsal: true,
            stasiunTujuan: true,
            tarif: true,
          },
        },
      },
    });

    if (!jadwal) {
      return { success: false, error: 'Jadwal perjalanan kereta tidak ditemukan.' };
    }

    // Cek apakah kereta sudah berangkat
    const now = new Date();
    if (new Date(jadwal.waktuBerangkat) <= now) {
      return { success: false, error: 'Kereta ini sudah berangkat atau penjualan tiket telah ditutup.' };
    }

    // ========================================================================
    // LAPISAN 3: VALIDASI KURSI DI GERBONG & IDENTITAS PENUMPANG
    // ========================================================================
    for (const p of penumpangList) {
      if (!p.nama || p.nama.trim().length < 3) {
        return { success: false, error: `Nama penumpang "${p.nama}" tidak valid (minimal 3 karakter).` };
      }
      if (!p.identitas || p.identitas.trim().length < 8) {
        return { success: false, error: `Nomor identitas penumpang "${p.nama}" tidak valid.` };
      }
    }

    // Ambil info kursi dari database untuk memastikan kursi milik kereta tersebut
    const kursiDbList = await prisma.kursi.findMany({
      where: {
        id: { in: Array.from(uniqueSeatIds) },
      },
      include: {
        gerbong: true,
      },
    });

    if (kursiDbList.length !== uniqueSeatIds.size) {
      return { success: false, error: 'Satu atau lebih kursi yang Anda pilih tidak valid di sistem.' };
    }

    // Pastikan seluruh kursi berada di kereta yang bertugas pada jadwal ini
    const invalidKeretaSeat = kursiDbList.find((k) => k.gerbong.keretaId !== jadwal.keretaId);
    if (invalidKeretaSeat) {
      return { success: false, error: 'Kursi yang dipilih tidak sesuai dengan rangkaian kereta jadwal ini.' };
    }

    // Tentukan kelas kereta dan cari tarif yang cocok
    const kelasKursi = kursiDbList[0].gerbong.kelas;
    const tarifRute = jadwal.rute.tarif.find((t) => t.kelas === kelasKursi);
    if (!tarifRute) {
      return { success: false, error: `Tarif untuk kelas ${kelasKursi} pada rute ini belum diatur.` };
    }

    const hargaPerTiket = Number(tarifRute.harga);
    const totalBayar = hargaPerTiket * penumpangList.length;

    // Batas waktu pembayaran 15 menit dari sekarang (untuk background worker)
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
    const kodeBooking = generateBookingCode();

    // ========================================================================
    // DATABASE TRANSACTION (ACID) & ANTI-RACE CONDITION
    // ========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek Ketersediaan Kursi (Pre-check aktif)
      // Periksa apakah kursi sudah dipesan oleh pesanan PAID atau PENDING yang belum expired
      const bookedSeats = await tx.detailTiket.findMany({
        where: {
          jadwalId: jadwal.id,
          kursiId: { in: Array.from(uniqueSeatIds) },
          statusTiket: { in: ['BOOKED', 'BOARDED'] },
          pemesanan: {
            statusPembayaran: { in: ['PAID', 'PENDING'] },
            expiredAt: { gt: now }, // Hanya yang belum kedaluwarsa
          },
        },
        include: {
          kursi: true,
        },
      });

      if (bookedSeats.length > 0) {
        const bookedNumbers = bookedSeats.map((b) => b.kursi.nomorKursi).join(', ');
        throw new Error(`SEAT_TAKEN:${bookedNumbers}`);
      }

      // 2. Buat Header Pemesanan Tiket
      const newPemesanan = await tx.pemesanan.create({
        data: {
          kodeBooking,
          userId: currentUser.id,
          jadwalId: jadwal.id,
          statusPembayaran: 'PENDING',
          totalBayar,
          expiredAt,
        },
      });

      // 3. Masukkan Detail Tiket Seluruh Penumpang
      // Di sinilah Constraint Unik Database (idx_anti_double_booking) bekerja:
      // Jika 2 user lolos pre-check di milidetik bersamaan, PostgreSQL akan MENOLAK insert kedua
      // dan melempar error P2002 (Unique constraint violation), memicu ROLLBACK otomatis!
      for (const p of penumpangList) {
        await tx.detailTiket.create({
          data: {
            pemesananId: newPemesanan.id,
            jadwalId: jadwal.id, // Kunci anti double-booking
            penumpangNama: p.nama.trim(),
            penumpangIdentitas: p.identitas.trim(),
            kursiId: p.kursiId,
            statusTiket: 'BOOKED',
          },
        });
      }

      return newPemesanan;
    });

    return {
      success: true,
      kodeBooking: result.kodeBooking,
      totalBayar: Number(result.totalBayar),
      expiredAt: result.expiredAt.toISOString(),
    };

  } catch (error: any) {
    // Tangani Kasus Kursi Baru Saja Diambil Orang Lain (Race Condition)
    if (error.message && error.message.startsWith('SEAT_TAKEN:')) {
      const seats = error.message.replace('SEAT_TAKEN:', '');
      return {
        success: false,
        error: `Maaf, kursi (${seats}) baru saja dipesan oleh penumpang lain beberapa detik lalu. Silakan pilih kursi lain.`,
      };
    }

    // Tangani Error Constraint Unik PostgreSQL (P2002 di Prisma)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: 'Terjadi bentrokan pemesanan: Kursi yang Anda pilih baru saja diambil oleh penumpang lain. Silakan pilih kursi lain.',
      };
    }

    console.error('[BOOKING TRANSACTION ERROR]:', error);
    return {
      success: false,
      error: 'Gagal memproses transaksi pemesanan tiket. Silakan coba lagi.',
    };
  }
}