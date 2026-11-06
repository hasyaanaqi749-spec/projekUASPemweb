'use client';

import React, { useState, useEffect } from 'react';

interface PassengerTicket {
  id: string;
  penumpangNama?: string;
  nama?: string;
  penumpangIdentitas?: string;
  identitas?: string;
  nik?: string;
  kodeBooking?: string;
  nomorKursi?: string;
  kursi?: string;
  gerbong?: string;
  namaKereta?: string;
  rute?: string;
  statusTiket?: 'BOOKED' | 'BOARDED' | string;
}

export default function PortalPetugasPage() {
  const [tickets, setTickets] = useState<PassengerTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [scanCode, setScanCode] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState<boolean>(false);

  // Ambil daftar tiket lunas dari Supabase via API
  const fetchTickets = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/petugas');
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Gagal memuat tiket.');
      }

      const list: PassengerTicket[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];

      setTickets(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyambung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handler tombol "Check-in Sekarang →" di setiap baris
  const handleCheckInTicket = async (ticket: PassengerTicket) => {
    if (!ticket.id) return;

    setProcessingId(ticket.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Gagal check-in.');
      }

      setSuccessMsg(
        `✓ Penumpang ${ticket.penumpangNama || ticket.nama || 'ini'} berhasil Check-in (BOARDED).`
      );

      // Ubah status lokal secara langsung agar tombol berubah hijau seketika
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, statusTiket: 'BOARDED' } : t))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses check-in.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handler input / scan kode booking di atas
  const handleValidateBookingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanCode.trim().toUpperCase();
    if (!code) return;

    setIsValidatingCode(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kodeBooking: code }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error || `Kode booking ${code} tidak valid.`);
      }

      setSuccessMsg(json.message || `Kode booking ${code} valid & berhasil check-in!`);
      setScanCode('');
      await fetchTickets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memvalidasi tiket.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const totalCount = tickets.length;
  const boardedCount = tickets.filter((t) => t.statusTiket === 'BOARDED').length;
  const unboardedCount = totalCount - boardedCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-sm font-semibold">{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Notifikasi Berhasil */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-sm font-semibold">{successMsg}</span>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-100 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Portal Petugas */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
                ROLE: PETUGAS STASIUN
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Gate Boarding Aktif (Supabase)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Portal Validasi Boarding Tiket
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pemeriksaan &amp; Validasi Tiket Penumpang Berbayar (PAID) secara langsung dengan Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              {loading ? '↻ Memuat...' : '↻ Refresh Data'}
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/login';
              }}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs rounded-xl transition-all"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Section 1: Scan / Input Kode Booking */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            INPUT / SCAN KODE BOOKING TIKET
          </label>
          <form onSubmit={handleValidateBookingCode} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: KAI-H02JF"
              className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl text-sm font-mono uppercase tracking-wider text-slate-800 placeholder-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={isValidatingCode || !scanCode.trim()}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0"
            >
              {isValidatingCode ? 'Memvalidasi...' : 'Validasi Tiket'}
            </button>
          </form>
        </div>

        {/* Section 2: Daftar Penumpang Siap Boarding */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Daftar Penumpang Siap Boarding (Tiket Lunas)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua tiket berstatus PAID di Supabase otomatis tampil di sini.
              </p>
            </div>

            {/* Badges Jumlah */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                Total: {totalCount} Penumpang
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                Belum: {unboardedCount}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                Boarded: {boardedCount}
              </span>
            </div>
          </div>

          {/* List Tiket */}
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Memuat data tiket dari Supabase...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Belum ada tiket berstatus PAID.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t, idx) => {
                const passengerName =
                  t.penumpangNama || t.nama || `Penumpang #${idx + 1}`;
                const bookingCode = t.kodeBooking || '-';
                const seatNumber = t.nomorKursi || t.kursi || '1A';
                const carriage = t.gerbong || 'Gerbong 1';
                const isBoarded = t.statusTiket === 'BOARDED';
                const isUpdating = processingId === t.id;

                return (
                  <div
                    key={t.id || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {passengerName}
                        </span>
                        {(t.penumpangIdentitas || t.nik || t.identitas) && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                            NIK: {t.penumpangIdentitas || t.nik || t.identitas}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>
                          Kode: <strong className="font-mono text-slate-800">{bookingCode}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Kursi: <strong className="text-slate-800 font-semibold">{seatNumber}</strong> ({carriage})
                        </span>
                        {t.namaKereta && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600">{t.namaKereta}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isBoarded ? (
                        <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                          <span>✓</span>
                          <span>SUDAH BOARDING (CHECKED-IN)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckInTicket(t)}
                          disabled={isUpdating}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isUpdating ? (
                            <span>Memproses...</span>
                          ) : (
                            <span>BELUM CHECK-IN (Check-in Sekarang →)</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}