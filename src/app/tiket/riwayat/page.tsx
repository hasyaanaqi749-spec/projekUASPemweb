// src/app/tiket/riwayat/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Riwayat Pemesanan Tiket Penumpang
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Train, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface HistoryBooking {
  id: string;
  kodeBooking: string;
  namaKereta: string;
  rute: string;
  waktuBerangkat: string;
  totalBayar: number;
  statusPembayaran: 'PAID' | 'PENDING' | 'CANCELLED';
}

export default function RiwayatTiketPage() {
  const [bookings, setBookings] = useState<HistoryBooking[]>([
    {
      id: 'b-1',
      kodeBooking: 'KAI-7W9NU',
      namaKereta: 'Taksaka Malam',
      rute: 'Gambir (GMR) → Yogyakarta (YK)',
      waktuBerangkat: '20:45 WIB',
      totalBayar: 550000,
      statusPembayaran: 'PAID',
    },
    {
      id: 'b-2',
      kodeBooking: 'KAI-U4C34',
      namaKereta: 'Taksaka Malam',
      rute: 'Gambir (GMR) → Yogyakarta (YK)',
      waktuBerangkat: '20:45 WIB',
      totalBayar: 550000,
      statusPembayaran: 'PAID',
    },
    {
      id: 'b-3',
      kodeBooking: 'KAI-QT0OW',
      namaKereta: 'Taksaka Malam',
      rute: 'Gambir (GMR) → Yogyakarta (YK)',
      waktuBerangkat: '20:45 WIB',
      totalBayar: 550000,
      statusPembayaran: 'PENDING',
    },
  ]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Pesanan Tiket
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Daftar seluruh tiket kereta api yang pernah Anda pesan di akun Railink.
            </p>
          </div>
        </div>

        {/* LIST TIKET */}
        <div className="space-y-4">
          {bookings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-blue-600 text-base">
                    {item.kodeBooking}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    item.statusPembayaran === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.statusPembayaran === 'PAID' ? 'Lunas' : 'Menunggu Pembayaran'}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{item.namaKereta}</h3>
                <p className="text-xs text-slate-500">{item.rute} • {item.waktuBerangkat}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
                <span className="text-lg font-black text-orange-600">
                  {formatRupiah(item.totalBayar)}
                </span>
                <Link
                  href={`/booking/${item.kodeBooking}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Lihat E-Tiket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}