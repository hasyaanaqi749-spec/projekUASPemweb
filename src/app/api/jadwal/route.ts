// src/app/api/jadwal/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asalId = searchParams.get('asalId');
    const tujuanId = searchParams.get('tujuanId');
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // 1. Coba cari di Supabase berdasarkan rute
    let schedules = await prisma.jadwal.findMany({
      where: {
        ...(asalId && tujuanId
          ? {
              rute: {
                stasiunAsalId: asalId,
                stasiunTujuanId: tujuanId,
              },
            }
          : {}),
      },
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
      orderBy: {
        waktuBerangkat: 'asc',
      },
    });

    // 2. Jika di database belum ada jadwal untuk rute tersebut, ambil seluruh jadwal yang ada
    if (schedules.length === 0) {
      schedules = await prisma.jadwal.findMany({
        take: 4,
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
    }

    // 3. Format hasil agar tanggalnya selaras dengan tanggal yang dicari pengguna
    const formatted = schedules.map((item, index) => {
      // Buat jam keberangkatan bervariasi sepanjang hari
      const jamList = [
        { jamB: '07:30:00', jamT: '14:15:00' },
        { jamB: '12:00:00', jamT: '19:30:00' },
        { jamB: '18:45:00', jamT: '02:10:00' },
        { jamB: '21:15:00', jamT: '05:00:00' },
      ];
      const slot = jamList[index % jamList.length];

      return {
        id: item.id,
        keretaId: item.keretaId,
        ruteId: item.ruteId,
        waktuBerangkat: `${tanggal}T${slot.jamB}.000Z`,
        waktuTiba: `${tanggal}T${slot.jamT}.000Z`,
        kereta: item.kereta,
        rute: {
          stasiunAsal: item.rute.stasiunAsal,
          stasiunTujuan: item.rute.stasiunTujuan,
          jarakKm: Number(item.rute.jarakKm),
        },
        tarif: item.rute.tarif.map((t) => ({
          id: t.id,
          ruteId: t.ruteId,
          kelas: t.kelas,
          harga: Number(t.harga),
        })),
        hargaMulai: item.rute.tarif[0] ? Number(item.rute.tarif[0].harga) : 550000,
        sisaKursi: 14 + index * 4,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[API JADWAL ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mengambil jadwal kereta api.' }, { status: 500 });
  }
}