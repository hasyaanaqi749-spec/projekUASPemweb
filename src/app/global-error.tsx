// ========================================================================
// app/global-error.tsx
// Root Error Boundary Global (Next.js App Router)
// Fitur: Menangkap unhandled exception, UI fallback ramah pengguna,
//        tombol recovery retry, error code reference.
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home, Train, ShieldAlert } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Catat error ke console browser
    console.error('[GlobalError Boundary Triggered]:', error);
  }, [error]);

  const errorReference = error.digest || `ERR-${Date.now().toString(36).toUpperCase()}`;

  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 antialiased">
        {/* Simple Fallback Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-blue-700 flex items-center justify-center text-white shadow-md">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">Railink</span>
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                Sistem Terkendala
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>

            {/* Heading & Explanation */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Terjadi Kendala Teknis Pada Sistem
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Mohon maaf atas ketidaknyamanan ini. Terjadi kesalahan tak terduga saat memproses halaman tiket kereta Anda. Tim teknis kami telah mencatat peristiwa ini.
              </p>
            </div>

            {/* Technical Digest Code */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Kode Referensi Masalah:</span>
                <span className="text-amber-400 font-bold">{errorReference}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {error.message || 'Unhandled Runtime Application Exception'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Muat Ulang</span>
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Sistem Proteksi Transaksi Railink tetap aman.</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-4 text-center text-[11px] text-slate-500">
          Sistem Informasi Kereta Api &copy; 2026 • Kelompok 14
        </footer>
      </body>
    </html>
  );
}