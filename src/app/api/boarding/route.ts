import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rawTickets = await prisma.detailTiket.findMany({
      where: {
        pemesanan: {
          statusPembayaran: 'PAID',
        },
      },
      include: {
        pemesanan: true,
        kursi: { include: { gerbong: true } },
        jadwal: { include: { kereta: true, rute: { include: { stasiunAsal: true, stasiunTujuan: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tickets = rawTickets.map((t) => ({
      id: t.id,
      penumpangNama: t.penumpangNama,
      nama: t.penumpangNama,
      penumpangIdentitas: t.penumpangIdentitas,
      kodeBooking: t.pemesanan?.kodeBooking || '-',
      nomorKursi: t.kursi?.nomorKursi || '-',
      kursi: t.kursi?.nomorKursi || '-',
      gerbong: t.kursi?.gerbong?.nomorGerbong ? `Gerbong ${t.kursi.gerbong.nomorGerbong}` : '-',
      namaKereta: t.jadwal?.kereta?.namaKereta || '-',
      statusTiket: t.statusTiket,
    }));

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticketId = body.id || body.ticketId;
    const kodeBooking = (body.kodeBooking || body.kode || '').trim().toUpperCase();

    if (ticketId) {
      const updated = await prisma.detailTiket.update({
        where: { id: ticketId },
        data: { statusTiket: 'BOARDED' },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (kodeBooking) {
      const booking = await prisma.pemesanan.findFirst({
        where: { kodeBooking },
      });

      if (!booking) {
        return NextResponse.json({ success: false, error: 'Kode booking tidak ditemukan' }, { status: 404 });
      }

      await prisma.detailTiket.updateMany({
        where: { pemesananId: booking.id },
        data: { statusTiket: 'BOARDED' },
      });

      return NextResponse.json({ success: true, message: 'Check-in berhasil' });
    }

    return NextResponse.json({ success: false, error: 'Parameter tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}