// src/app/cek-booking/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Cek Kode Booking & Pencarian E-Tiket
// ========================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Search, Train, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function CekBookingPage() {
  const router = useRouter();
  const [bookingCode, setBookingCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = bookingCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Silakan masukkan kode booking tiket Anda.');
      return;
    }

    // Arahkan langsung ke halaman detail tiket resmi
    router.push(`/booking/${cleanCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* BRAND & HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Ticket className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Cek Kode Booking Tiket
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Masukkan kode booking 6-8 digit untuk melihat E-Tiket, status pembayaran, atau cetak boarding pass.
          </p>
        </div>

        {/* FORM PENCARIAN KODE BOOKING */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <form onSubmit={handleSearchBooking} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                Kode Booking Tiket (Contoh: KAI-7W9NU atau KAI-U4C34)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="KAI-XXXXX"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-black text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span>Cari E-Tiket Saya</span>
            </button>
          </form>

          {/* CONTOH KODE BOOKING DARI DATABASE SUPABASE */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Contoh Kode Booking Siap Diuji:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {['KAI-7W9NU', 'KAI-U4C34', 'KAI-2BVYB'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setBookingCode(code)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-mono font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}