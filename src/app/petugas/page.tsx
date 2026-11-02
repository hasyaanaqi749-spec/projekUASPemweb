'use client';

import { logoutAction } from '@/app/actions/authActions';
import { useState } from 'react';

export default function PetugasPage() {
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
  };

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode) return;
    setStatus(`Tiket ${kode.toUpperCase()} Berhasil Di-Boarding! Kursi tervalidasi.`);
    setKode('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Petugas */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              ROLE: PETUGAS STASIUN
            </span>
            <h1 className="text-3xl font-black text-white mt-2">Portal Validasi Boarding Tiket</h1>
            <p className="text-slate-400 text-sm">Pemeriksaan & Validasi Tiket Penumpang Kereta Api</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30 transition-colors"
          >
            Keluar Akun
          </button>
        </div>

        {/* Input Validasi */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-lg">Input / Scan Kode Booking Tiket</h3>
          <form onSubmit={handleCheckin} className="flex gap-3">
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Contoh: KAI-L7812A"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition-all"
            >
              Validasi Tiket
            </button>
          </form>

          {status && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              ✅ {status}
            </div>
          )}
        </div>

        {/* Daftar Penumpang */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-white text-sm">
            Daftar Penumpang Siap Boarding (KA-67 Taksaka Malam)
          </div>
          <div className="divide-y divide-slate-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Budi Santoso</p>
                <p className="text-xs text-slate-400">Kode: <span className="font-mono text-orange-400">KAI-L7812A</span> | Kursi: Eksekutif 1 - 1A</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BOARDED ✅
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Siti Rahmawati</p>
                <p className="text-xs text-slate-400">Kode: <span className="font-mono text-orange-400">KAI-P4491X</span> | Kursi: Eksekutif 1 - 1B</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                BELUM CHECK-IN
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}