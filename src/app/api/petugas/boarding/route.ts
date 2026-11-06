import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Cek / Verifikasi Tiket Sebelum Boarding (Bisa lewat query ?kodeBooking=...)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeBooking = searchParams.get('kodeBooking');

    // Jika tidak ada parameter kodeBooking, tampilkan daftar tiket yang sudah LUNAS (PAID)
    if (!kodeBooking) {
      const listTiket = await prisma.pemesanan.findMany({
        where: {
          statusPembayaran: 'PAID',
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({ success: true, data: listTiket });
    }

    // Jika ada kodeBooking, cari tiket spesifik
    const cleanKode = kodeBooking.trim().toUpperCase();
    const booking = await prisma.pemesanan.findUnique({
      where: {
        kodeBooking: cleanKode,
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
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: `Kode booking "${cleanKode}" tidak ditemukan di sistem.` },
        { status: 404 }
      );
    }

    // Cek status pembayaran
    if (booking.statusPembayaran !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          message: `Tiket belum dapat di-boarding karena status pembayaran masih ${booking.statusPembayaran}. Harap lunasi pembayaran terlebih dahulu.`,
          data: booking,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tiket valid dan siap untuk proses boarding.',
      data: booking,
    });
  } catch (error: any) {
    console.error('Error checking boarding ticket:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Eksekusi Boarding (Mengubah Status Tiket Menjadi BOARDED)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kodeBooking = body.kodeBooking ? String(body.kodeBooking).trim().toUpperCase() : '';

    if (!kodeBooking) {
      return NextResponse.json(
        { success: false, message: 'Kode booking wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Cari pemesanan di database
    const booking = await prisma.pemesanan.findUnique({
      where: {
        kodeBooking,
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
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: `Tiket dengan kode booking "${kodeBooking}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 2. Validasi Pembayaran
    if (booking.statusPembayaran !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          message: `Boarding ditolak: Status tiket masih ${booking.statusPembayaran}. Tiket harus berstatus PAID (Lunas).`,
        },
        { status: 400 }
      );
    }

    // 3. Cek apakah seluruh penumpang pada tiket ini sudah pernah di-boarding
    const semuaSudahBoarding = booking.detailTiket.length > 0 &&
      booking.detailTiket.every((t: any) => t.statusTiket === 'BOARDED');

    if (semuaSudahBoarding) {
      return NextResponse.json(
        {
          success: false,
          message: `Tiket ${booking.kodeBooking} (${booking.user.nama}) sudah pernah di-boarding sebelumnya. Tidak dapat digunakan dua kali.`,
        },
        { status: 400 }
      );
    }

    // 4. Update status tiket menjadi BOARDED
    await prisma.detailTiket.updateMany({
      where: {
        pemesananId: booking.id,
      },
      data: {
        statusTiket: 'BOARDED',
      },
    });

    // Ambil nama penumpang utama
    const namaPenumpang = booking.detailTiket[0]?.penumpangNama || booking.user.nama;

    return NextResponse.json({
      success: true,
      message: `Tiket ${booking.kodeBooking} (${namaPenumpang}) BERHASIL DI-BOARDING! Silakan masuk ke gerbong.`,
      data: {
        kodeBooking: booking.kodeBooking,
        penumpang: namaPenumpang,
        kereta: booking.jadwal.kereta.namaKereta,
        rute: `${booking.jadwal.rute.stasiunAsal.namaStasiun} → ${booking.jadwal.rute.stasiunTujuan.namaStasiun}`,
        statusTiket: 'BOARDED',
        waktuBoarding: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error boarding ticket:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}