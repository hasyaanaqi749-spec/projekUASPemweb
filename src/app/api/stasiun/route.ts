// src/app/api/stasiun/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stations = await prisma.stasiun.findMany({
      orderBy: { namaStasiun: 'asc' },
    });

    return NextResponse.json(stations);
  } catch (error: any) {
    console.error('[API STASIUN ERROR]:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data stasiun dari database.' },
      { status: 500 }
    );
  }
}