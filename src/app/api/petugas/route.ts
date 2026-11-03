import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper mencari kursi kosong untuk auto-healing data lama
async function getAvailableKursiForJadwal(jadwalId: string): Promise<string> {
  const bookedTickets = await prisma.detailTiket.findMany({
    where: { jadwalId: jadwalId },
    select: { kursiId: true },
  });
  const bookedKursiIds = bookedTickets.map((t) => t.kursiId);

  let kursi = await prisma.kursi.findFirst({
    where: {
      id: { notIn: bookedKursiIds },
    },
  });

  if (!kursi) {
    let gerbong = await prisma.gerbong.findFirst();
    if (!gerbong) {
      let kereta = await prisma.kereta.findFirst();
      if (!kereta) {
        kereta = await prisma.kereta.create({
          data: {
            namaKereta: 'Taksaka Malam',
            kodeKereta: `KA-${Math.floor(10 + Math.random() * 80)}`,
          },
        });
      }
      gerbong = await prisma.gerbong.create({
        data: {
          keretaId: kereta.id,
          namaGerbong: 'Eksekutif 1',
          nomorGerbong: 1,
          kelas: 'EKSEKUTIF',
        },
      });
    }

    const count = await prisma.kursi.count({ where: { gerbongId: gerbong.id } });
    const row = Math.floor(count / 4) + 1;
    const col = ['A', 'B', 'C', 'D'][count % 4];

    kursi = await prisma.kursi.create({
      data: {
        gerbongId: gerbong.id,
        nomorKursi: `${row}${col}`,
      },
    });
  }

  return kursi.id;
}

// GET: Mengambil seluruh tiket boarding berstatus PAID
export async function GET() {
  try {
    // 1. Auto-healing jika ada booking PAID tapi belum memiliki detailTiket
    const paidWithoutTicket = await prisma.pemesanan.findMany({
      where: {
        statusPembayaran: 'PAID',
        detailTiket: { none: {} },
      },
      include: { user: true, jadwal: true },
    });

    if (paidWithoutTicket.length > 0) {
      for (const order of paidWithoutTicket) {
        const validKursiId = await getAvailableKursiForJadwal(order.jadwalId);
        await prisma.detailTiket.create({
          data: {
            pemesananId: order.id,
            jadwalId: order.jadwalId,
            penumpangNama: order.user?.nama || 'Penumpang',
            penumpangIdentitas: `317${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
            kursiId: validKursiId,
            statusTiket: 'BOOKED',
          },
        });
      }
    }

    // 2. Query tiket boarding PAID
    const detailTiketList = await prisma.detailTiket.findMany({
      where: {
        pemesanan: {
          statusPembayaran: 'PAID',
        },
      },
      include: {
        pemesanan: {
          include: {
            user: true,
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
    });

    const formatted = detailTiketList.map((t) => ({
      id: t.id,
      kodeBooking: t.pemesanan.kodeBooking,
      namaPenumpang: t.penumpangNama || t.pemesanan.user?.nama || 'Penumpang',
      identitas: t.penumpangIdentitas || '-',
      namaKereta: t.jadwal?.kereta?.namaKereta || 'Taksaka Malam',
      posisiKursi: t.kursi
        ? `${t.kursi.gerbong?.namaGerbong || 'Eksekutif 1'} - ${t.kursi.nomorKursi}`
        : 'Eksekutif 1 - 1A',
      statusTiket: t.statusTiket || 'BOOKED',
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching boarding tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat tiket boarding' },
      { status: 500 }
    );
  }
}

// POST: Validasi kode booking & Check-In
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawKode = body.kodeBooking || body.kode;
    const tiketId = body.tiketId || body.id;

    if (!rawKode && !tiketId) {
      return NextResponse.json(
        { success: false, error: 'Wajib memasukkan kode booking atau tiketId' },
        { status: 400 }
      );
    }

    let ticket = null;

    if (tiketId) {
      ticket = await prisma.detailTiket.findUnique({
        where: { id: String(tiketId) },
        include: { pemesanan: true },
      });
    } else {
      const kodeClean = String(rawKode).trim().toUpperCase();
      ticket = await prisma.detailTiket.findFirst({
        where: {
          pemesanan: {
            kodeBooking: kodeClean,
          },
        },
        include: { pemesanan: true },
      });

      if (!ticket) {
        const order = await prisma.pemesanan.findFirst({
          where: { kodeBooking: kodeClean },
          include: { user: true, jadwal: true },
        });

        if (!order) {
          return NextResponse.json(
            { success: false, error: `Kode booking ${kodeClean} tidak ditemukan.` },
            { status: 404 }
          );
        }

        if (order.statusPembayaran !== 'PAID') {
          return NextResponse.json(
            {
              success: false,
              error: `Kode booking ${kodeClean} belum berstatus PAID (Status: ${order.statusPembayaran}). Konfirmasi bayar di Admin dulu.`,
            },
            { status: 400 }
          );
        }

        const validKursiId = await getAvailableKursiForJadwal(order.jadwalId);
        ticket = await prisma.detailTiket.create({
          data: {
            pemesananId: order.id,
            jadwalId: order.jadwalId,
            penumpangNama: order.user?.nama || 'Penumpang',
            penumpangIdentitas: `317${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
            kursiId: validKursiId,
            statusTiket: 'BOARDED',
          },
          include: { pemesanan: true },
        });

        return NextResponse.json({
          success: true,
          message: `Tiket ${kodeClean} berhasil divalidasi dan CHECK-IN (BOARDED)!`,
          data: ticket,
        });
      }
    }

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan di database Supabase.' },
        { status: 404 }
      );
    }

    if (ticket.pemesanan.statusPembayaran !== 'PAID') {
      return NextResponse.json(
        { success: false, error: `Kode booking ${ticket.pemesanan.kodeBooking} belum berstatus PAID.` },
        { status: 400 }
      );
    }

    const updated = await prisma.detailTiket.update({
      where: { id: ticket.id },
      data: {
        statusTiket: 'BOARDED',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Penumpang ${ticket.penumpangNama} (${ticket.pemesanan.kodeBooking}) Berhasil Check-In (BOARDED)!`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error validating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memvalidasi tiket' },
      { status: 500 }
    );
  }
}