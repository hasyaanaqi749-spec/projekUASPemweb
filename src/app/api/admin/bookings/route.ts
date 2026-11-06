import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// =========================================================================
// 1. GET: Mengambil semua data pemesanan tiket untuk Portal Admin
// =========================================================================
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
      data: bookings,
    });
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data dari Supabase.',
        error: error?.message || 'Database connection error',
      },
      { status: 500 }
    );
  }
}

// =========================================================================
// 2. POST: Menambah data pemesanan baru (Tombol "+ Tambah Data ke Supabase")
// =========================================================================
export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // 1. Dapatkan atau buat User penumpang
    let targetUser = await prisma.user.findFirst({
      where: { role: 'PENUMPANG' as any },
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email: body.email || `penumpang_${Date.now()}@gmail.com`,
          nama: body.nama || 'Ahmad Fauzi',
          phone: body.phone || '081234567890',
          passwordHash: 'dummy_hash_kai_2026',
          role: 'PENUMPANG' as any,
        },
      });
    }

    // 2. Dapatkan Jadwal yang ada beserta Kereta dan Gerbong
    let targetJadwal = await prisma.jadwal.findFirst({
      include: {
        kereta: {
          include: {
            gerbong: {
              include: {
                kursi: true,
              },
            },
          },
        },
        rute: true,
      },
    });

    // Jika belum ada jadwal sama sekali di Supabase, buat master data lengkap
    if (!targetJadwal) {
      let stasiunGMR = await prisma.stasiun.findFirst({ where: { kodeStasiun: 'GMR' } });
      if (!stasiunGMR) {
        stasiunGMR = await prisma.stasiun.create({
          data: {
            kodeStasiun: 'GMR',
            namaStasiun: 'Gambir',
            kota: 'Jakarta Pusat',
          },
        });
      }

      let stasiunSMT = await prisma.stasiun.findFirst({ where: { kodeStasiun: 'SMT' } });
      if (!stasiunSMT) {
        stasiunSMT = await prisma.stasiun.create({
          data: {
            kodeStasiun: 'SMT',
            namaStasiun: 'Semarang Tawang',
            kota: 'Semarang',
          },
        });
      }

      let targetRute = await prisma.rute.findFirst();
      if (!targetRute) {
        targetRute = await prisma.rute.create({
          data: {
            stasiunAsalId: stasiunGMR.id,
            stasiunTujuanId: stasiunSMT.id,
            jarakKm: 440,
            waktuTempuhMenit: 330,
          },
        });
      }

      let targetKereta = await prisma.kereta.findFirst({
        include: {
          gerbong: {
            include: { kursi: true },
          },
        },
      });

      if (!targetKereta) {
        targetKereta = await prisma.kereta.create({
          data: {
            kodeKereta: 'KA-ARG-01',
            namaKereta: 'Argo Bromo Anggrek Luxury',
            tipe: 'EKSEKUTIF',
            gerbong: {
              create: [
                {
                  namaGerbong: 'Eksekutif 1',
                  nomorGerbong: 1,
                  kelas: 'EKSEKUTIF',
                  kursi: {
                    create: [
                      { nomorKursi: '1A' },
                      { nomorKursi: '1B' },
                      { nomorKursi: '2A' },
                      { nomorKursi: '2B' },
                      { nomorKursi: '3A' },
                      { nomorKursi: '3B' },
                    ],
                  },
                },
              ],
            },
          },
          include: {
            gerbong: {
              include: { kursi: true },
            },
          },
        });
      }

      const besok = new Date();
      besok.setDate(besok.getDate() + 1);
      besok.setHours(8, 0, 0, 0);

      const tiba = new Date(besok);
      tiba.setHours(13, 30, 0, 0);

      targetJadwal = await prisma.jadwal.create({
        data: {
          keretaId: targetKereta.id,
          ruteId: targetRute.id,
          waktuBerangkat: besok,
          waktuTiba: tiba,
        },
        include: {
          kereta: {
            include: {
              gerbong: {
                include: { kursi: true },
              },
            },
          },
          rute: true,
        },
      });
    }

    // Pastikan ada gerbong
    let targetGerbong = targetJadwal.kereta?.gerbong?.[0];
    if (!targetGerbong) {
      targetGerbong = await prisma.gerbong.create({
        data: {
          keretaId: targetJadwal.keretaId,
          namaGerbong: 'Eksekutif 1',
          nomorGerbong: 1,
          kelas: 'EKSEKUTIF',
        },
        include: { kursi: true },
      });
    }

    // 3. CARI KURSI KOSONG (Cek kursi yang belum pernah dipesan pada jadwal ini)
    const existingBookings = await prisma.detailTiket.findMany({
      where: { jadwalId: targetJadwal.id },
      select: { kursiId: true },
    });
    const bookedKursiIds = new Set(existingBookings.map((t: any) => t.kursiId));

    // Ambil kursi yang belum terpakai di gerbong ini
    let targetKursi = targetGerbong.kursi?.find((k: any) => !bookedKursiIds.has(k.id));

    // Jika semua kursi sudah terisi, otomatis buat kursi baru (misal 4A, 5A, dst) agar tidak terjadi duplikasi
    if (!targetKursi) {
      const totalKursi = (targetGerbong.kursi?.length || 0) + 1;
      const row = Math.ceil(totalKursi / 2);
      const col = totalKursi % 2 === 1 ? 'A' : 'B';
      const nomorBaru = `${row}${col}`;

      targetKursi = await prisma.kursi.create({
        data: {
          gerbongId: targetGerbong.id,
          nomorKursi: nomorBaru,
        },
      });
    }

    // 4. Generate Kode Booking Unik
    const kodeBooking =
      body.kodeBooking || `KAI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Waktu kedaluwarsa 2 jam ke depan
    const expiredAt = body.expiredAt
      ? new Date(body.expiredAt)
      : new Date(Date.now() + 2 * 60 * 60 * 1000);

    // 5. Buat Pemesanan baru di Supabase beserta Detail Tiket
    const newBooking = await prisma.pemesanan.create({
      data: {
        kodeBooking: kodeBooking,
        userId: targetUser.id,
        jadwalId: targetJadwal.id,
        totalBayar: body.totalBayar || 550000,
        statusPembayaran: (body.statusPembayaran || 'PENDING') as any,
        expiredAt: expiredAt,
        detailTiket: {
          create: {
            jadwalId: targetJadwal.id,
            penumpangNama: body.penumpangNama || targetUser.nama,
            penumpangIdentitas: body.penumpangIdentitas || '3301234567890001',
            kursiId: targetKursi.id,
            statusTiket: 'BOOKED' as any,
          },
        },
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tiket berhasil ditambahkan ke Supabase!',
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal membuat tiket di Supabase.',
        error: error?.message || 'Database insert error',
      },
      { status: 500 }
    );
  }
}

// =========================================================================
// 3. PATCH: Mengubah status pembayaran (Ubah ke PAID / CANCELLED / PENDING)
// Mendukung semua format nama field yang dikirim frontend
// =========================================================================
export async function PATCH(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Tangkap target ID dari berbagai kemungkinan nama variabel yang dikirim frontend
    const targetId = body.id || body.bookingId || body.pemesananId || body.kodeBooking;

    // Tangkap status baru (misal: 'PAID'), default ke 'PAID'
    const newStatus = (
      body.statusPembayaran ||
      body.statusBayar ||
      body.status ||
      'PAID'
    ).toUpperCase();

    if (!targetId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID pemesanan atau Kode Booking tidak ditemukan dalam request.',
        },
        { status: 400 }
      );
    }

    // Cari pemesanan berdasarkan UUID (id) ATAU Kode Booking
    const booking = await prisma.pemesanan.findFirst({
      where: {
        OR: [
          { id: targetId },
          { kodeBooking: targetId }
        ],
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: `Data pemesanan '${targetId}' tidak ditemukan di database Supabase.`,
        },
        { status: 404 }
      );
    }

    // Update status pembayaran di tabel pemesanan Supabase
    const updated = await prisma.pemesanan.update({
      where: { id: booking.id },
      data: {
        statusPembayaran: newStatus as any,
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
      message: `Status pemesanan ${booking.kodeBooking} berhasil diubah menjadi ${newStatus}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengubah status di Supabase.',
        error: error?.message || 'Database update error',
      },
      { status: 500 }
    );
  }
}

// =========================================================================
// 4. PUT: Mendukung jika frontend memanggil menggunakan method PUT
// =========================================================================
export async function PUT(request: Request) {
  return PATCH(request);
}