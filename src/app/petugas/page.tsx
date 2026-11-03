'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BoardingPassenger {
  id: string;
  kodeBooking: string;
  namaPenumpang: string;
  identitas: string;
  namaKereta: string;
  posisiKursi: string;
  statusTiket: 'BOOKED' | 'BOARDED';
}

export default function PetugasPortalPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState<BoardingPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [kodeInput, setKodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Mengambil daftar tiket siap boarding langsung dari Supabase
  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/petugas');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPassengers(data.data);
      } else {
        throw new Error(data.error || 'Gagal mengambil data boarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data dari Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  // Validasi kode booking lewat input/scanner
  const handleValidateTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!kodeInput.trim()) {
      setErrorMsg('Masukkan kode booking terlebih dahulu.');
      return;
    }

    setIsValidating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kodeBooking: kodeInput.trim().toUpperCase() }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || `Kode booking ${kodeInput} tidak valid atau belum PAID.`);
      }

      setSuccessMsg(result.message || `Tiket ${kodeInput.toUpperCase()} berhasil divalidasi!`);
      setKodeInput('');
      fetchPassengers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memvalidasi tiket');
    } finally {
      setIsValidating(false);
    }
  };

  // Check-in langsung dari kartu penumpang
  const handleCheckInCard = async (passenger: BoardingPassenger) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiketId: passenger.id,
          kodeBooking: passenger.kodeBooking,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal melakukan check-in');
      }

      setSuccessMsg(`Penumpang ${passenger.namaPenumpang} berhasil check-in (BOARDED)!`);
      setPassengers((prev) =>
        prev.map((p) => (p.id === passenger.id ? { ...p, statusTiket: 'BOARDED' } : p))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal check-in');
    }
  };

  const totalSiap = passengers.length;
  const belumCheckIn = passengers.filter((p) => p.statusTiket !== 'BOARDED').length;
  const sudahBoarded = passengers.filter((p) => p.statusTiket === 'BOARDED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-sm">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-semibold underline ml-4">
              Tutup
            </button>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-sm">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-semibold underline ml-4">
              Tutup
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                ROLE: PETUGAS STASIUN
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Gate Boarding Aktif (Supabase)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Portal Validasi Boarding Tiket
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pemeriksaan & Validasi Tiket Penumpang Berbayar (PAID) secara langsung dengan Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchPassengers}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
            >
              Refresh Data
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 shadow-sm transition"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Scanner / Manual Input Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>Input / Scan Kode Booking Tiket</span>
          </label>
          <form onSubmit={handleValidateTicket} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="CONTOH: KAI-H02JF"
              value={kodeInput}
              onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isValidating}
              className="px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-sm transition"
            >
              {isValidating ? 'Memvalidasi...' : 'Validasi Tiket'}
            </button>
          </form>
        </div>

        {/* Passenger List Ready for Boarding */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Penumpang Siap Boarding (Tiket Lunas)
              </h2>
              <p className="text-xs text-slate-400">
                Semua tiket berstatus PAID di Supabase otomatis tampil di sini.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 font-bold rounded-lg bg-slate-100 text-slate-600">
                Total: {totalSiap} Penumpang
              </span>
              <span className="px-3 py-1 font-bold rounded-lg bg-amber-100 text-amber-700">
                Belum: {belumCheckIn}
              </span>
              <span className="px-3 py-1 font-bold rounded-lg bg-emerald-100 text-emerald-700">
                Boarded: {sudahBoarded}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Menyinkronkan daftar penumpang dari Supabase...
              </div>
            ) : passengers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Belum ada tiket berstatus PAID. Silakan ubah status tiket ke PAID di Portal Admin terlebih dahulu.
              </div>
            ) : (
              passengers.map((p) => {
                const isBoarded = p.statusTiket === 'BOARDED';
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {p.namaPenumpang}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600">
                          {p.namaKereta}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>
                          Kode: <strong className="font-mono text-blue-600">{p.kodeBooking}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Kursi: <strong className="text-slate-700">{p.posisiKursi}</strong>
                        </span>
                      </div>
                    </div>

                    <div>
                      {isBoarded ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ SUDAH BOARDING (CHECKED-IN)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckInCard(p)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition"
                        >
                          BELUM CHECK-IN (Check-in Sekarang →)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}