import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Daftar nama penumpang bervariasi agar pemesan berbeda-beda
const NAMA_PENUMPANG_LIST = [
  'Rian Pratama',
  'Siti Nurhaliza',
  'Dewi Sartika',
  'Ahmad Fauzi',
  'Putri Wulandari',
  'Dimas Prasetyo',
  'Nabila Zahra',
  'Bambang Pamungkas',
  'Anisa Rahmawati',
  'Fajar Nugraha',
];

function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KAI-${result}`;
}

// Helper untuk mencari atau membuat kursi kosong (anti double-booking)
async function getAvailableKursiForJadwal(jadwalId: string, keretaId: string): Promise<string> {
  // 1. Ambil semua kursi yang sudah terpakai di jadwal ini
  const bookedTickets = await prisma.detailTiket.findMany({
    where: { jadwalId: jadwalId },
    select: { kursiId: true },
  });
  const bookedKursiIds = bookedTickets.map((t) => t.kursiId);

  // 2. Cari kursi di database yang belum dipesan untuk jadwal ini
  let availableKursi = await prisma.kursi.findFirst({
    where: {
      id: { notIn: bookedKursiIds },
    },
  });

  // 3. Jika semua kursi sudah penuh / belum ada, buat kursi baru di gerbong
  if (!availableKursi) {
    let gerbong = await prisma.gerbong.findFirst({
      where: { keretaId: keretaId },
    });

    if (!gerbong) {
      gerbong = await prisma.gerbong.create({
        data: {
          keretaId: keretaId,
          namaGerbong: 'Eksekutif 1',
          nomorGerbong: 1,
          kelas: 'EKSEKUTIF',
        },
      });
    }

    const currentTotalKursi = await prisma.kursi.count({
      where: { gerbongId: gerbong.id },
    });

    const rowNum = Math.floor(currentTotalKursi / 4) + 1;
    const colChar = ['A', 'B', 'C', 'D'][currentTotalKursi % 4];
    const uniqueNumber = `${rowNum}${colChar}`;

    availableKursi = await prisma.kursi.create({
      data: {
        gerbongId: gerbong.id,
        nomorKursi: uniqueNumber,
      },
    });
  }

  return availableKursi.id;
}

// GET: Ambil semua data pemesanan dari Supabase
export async function GET() {
  try {
    const pemesananList = await prisma.pemesanan.findMany({
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
        detailTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: pemesananList,
    });
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat data pemesanan' },
      { status: 500 }
    );
  }
}

// PATCH: Update status pembayaran ke PAID
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const targetKodeBooking = body.kodeBooking || body.kode;
    const targetId = body.id || body.bookingId;
    const nextStatus = body.status || 'PAID';

    if (!targetKodeBooking && !targetId) {
      return NextResponse.json(
        { success: false, error: 'Wajib menyertakan id atau kodeBooking' },
        { status: 400 }
      );
    }

    const whereClause = targetKodeBooking
      ? { kodeBooking: String(targetKodeBooking) }
      : { id: String(targetId) };

    const updated = await prisma.pemesanan.update({
      where: whereClause,
      data: {
        statusPembayaran: nextStatus,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        jadwal: {
          include: {
            kereta: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status booking ${updated.kodeBooking} berhasil diubah ke ${nextStatus}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui status booking' },
      { status: 500 }
    );
  }
}

// POST: Tambah data pemesanan baru (anti double-booking & nama acak bervariasi)
export async function POST(request: Request) {
  try {
    let customData: any = {};
    try {
      customData = await request.json();
    } catch {
      customData = {};
    }

    // 1. Tentukan nama dan email penumpang
    const randomName = NAMA_PENUMPANG_LIST[Math.floor(Math.random() * NAMA_PENUMPANG_LIST.length)];
    const namaPemesan = customData.nama || randomName;
    const cleanPrefix = namaPemesan.toLowerCase().replace(/[^a-z0-9]/g, '');
    const emailPemesan = customData.email || `${cleanPrefix}.${Date.now().toString().slice(-4)}@gmail.com`;

    // 2. Buat / ambil user penumpang
    let user = await prisma.user.findFirst({
      where: { email: emailPemesan },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          nama: namaPemesan,
          email: emailPemesan,
          phone: `081${Math.floor(100000000 + Math.random() * 900000000)}`,
          passwordHash: '$2a$10$dummyHashPassengerPassword',
          role: 'PENUMPANG',
        },
      });
    }

    // 3. Ambil jadwal kereta yang aktif
    let jadwal = await prisma.jadwal.findFirst({
      include: { kereta: true },
    });

    if (!jadwal) {
      let kereta = await prisma.kereta.findFirst();
      let rute = await prisma.rute.findFirst();

      if (!kereta) {
        kereta = await prisma.kereta.create({
          data: {
            namaKereta: 'Taksaka Malam',
            kodeKereta: `KA-${Math.floor(10 + Math.random() * 80)}`,
          },
        });
      }

      if (!rute) {
        let st1 = await prisma.stasiun.findFirst({ where: { kodeStasiun: 'GMR' } });
        let st2 = await prisma.stasiun.findFirst({ where: { kodeStasiun: 'YK' } });
        if (!st1) st1 = await prisma.stasiun.create({ data: { kodeStasiun: 'GMR', namaStasiun: 'Gambir', kota: 'Jakarta' } });
        if (!st2) st2 = await prisma.stasiun.create({ data: { kodeStasiun: 'YK', namaStasiun: 'Yogyakarta', kota: 'Yogyakarta' } });
        rute = await prisma.rute.create({
          data: { stasiunAsalId: st1.id, stasiunTujuanId: st2.id, jarakKm: 512 },
        });
      }

      jadwal = await prisma.jadwal.create({
        data: {
          keretaId: kereta.id,
          ruteId: rute.id,
          waktuBerangkat: new Date(Date.now() + 2 * 3600 * 1000),
          waktuTiba: new Date(Date.now() + 9 * 3600 * 1000),
        },
        include: { kereta: true },
      });
    }

    // 4. Cari kursi KOSONG yang belum pernah dibooking di jadwal ini (ANTI DOUBLE-BOOKING)
    const validKursiId = await getAvailableKursiForJadwal(jadwal.id, jadwal.keretaId);

    // 5. Buat kode booking unik
    const kodeBooking = generateBookingCode();
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    // 6. Buat Pemesanan BESERTA DetailTiket
    const newBooking = await prisma.pemesanan.create({
      data: {
        kodeBooking: kodeBooking,
        userId: user.id,
        jadwalId: jadwal.id,
        statusPembayaran: 'PENDING',
        totalBayar: 550000,
        expiredAt: expiredAt,
        detailTiket: {
          create: {
            jadwalId: jadwal.id,
            penumpangNama: namaPemesan,
            penumpangIdentitas: `317${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
            kursiId: validKursiId,
            statusTiket: 'BOOKED',
          },
        },
      },
      include: {
        user: true,
        jadwal: {
          include: {
            kereta: true,
          },
        },
        detailTiket: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pemesanan ${kodeBooking} atas nama ${namaPemesan} berhasil dibuat di Supabase`,
      data: newBooking,
    });
  } catch (error: any) {
    console.error('Error creating booking with passenger:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambahkan data pemesanan' },
      { status: 500 }
    );
  }
}