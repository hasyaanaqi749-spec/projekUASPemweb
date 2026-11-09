// ========================================================================
// app/not-found.tsx
// Halaman 404 (Not Found) Ramah Pengguna
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

import Link from 'next/link';
import { Train, Search, Ticket, Home, ArrowRight, MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 404 Train Graphic */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Train className="w-10 h-10 animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-rose-500 text-white shadow-md">
            404
          </span>
        </div>

        {/* Text Copy */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
            <MapPinOff className="w-3.5 h-3.5" />
            Jalur Perjalanan Tidak Ditemukan
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Kereta Tidak Melintasi Jalur Ini
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Halaman atau jadwal stasiun yang Anda tuju tidak tersedia, telah berganti rel, atau alamat tautan yang dimasukkan kurang tepat.
          </p>
        </div>

        {/* Quick Links Recommendation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <Link
            href="/"
            className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-slate-300 group-hover:text-amber-300">
              <Search className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Cari Jadwal Tiket</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/cek-booking"
            className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-slate-300 group-hover:text-blue-300">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">Cek Kode Booking</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Back to Home Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}