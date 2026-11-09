// ========================================================================
// app/petugas/validasi/page.tsx
// Halaman Validasi Keberangkatan & Check-in Tiket (Role: PETUGAS & ADMIN)
// Fitur: Form input/scanner, detail manifest, check-in atomik, feedback suara, riwayat harian
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Scan, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  User, 
  Train, 
  ShieldCheck, 
  QrCode, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Layers,
  ArrowRight,
  Sparkles,
  Ticket,
  Calendar,
  CheckCircle2,
  History,
  Lock
} from 'lucide-react';

interface Penumpang {
  id: string;
  penumpangNama?: string;
  penumpang_nama?: string;
  penumpangIdentitas?: string;
  penumpang_identitas?: string;
  statusTiket?: 'BOOKED' | 'BOARDED';
  status_tiket?: 'BOOKED' | 'BOARDED';
  createdAt?: string;
  kursi: {
    nomorKursi?: string;
    nomor_kursi?: string;
    gerbong: {
      nomorGerbong?: number | string;
      nomor_gerbong?: number | string;
      kelas: string;
    };
  };
}

interface BookingResult {
  id: string;
  kodeBooking?: string;
  kode_booking?: string;
  statusPembayaran?: 'PENDING' | 'PAID' | 'CANCELLED';
  status_pembayaran?: 'PENDING' | 'PAID' | 'CANCELLED';
  totalBayar?: number;
  total_bayar?: number;
  user?: {
    nama: string;
    email: string;
    phone: string;
  };
  jadwal: {
    waktuBerangkat?: string;
    waktu_berangkat?: string;
    waktuTiba?: string;
    waktu_tiba?: string;
    kereta: {
      namaKereta?: string;
      nama_kereta?: string;
      kodeKereta?: string;
      kode_kereta?: string;
    };
    rute: {
      stasiunAsal?: { kodeStasiun?: string; kode_stasiun?: string; namaStasiun?: string; nama_stasiun?: string };
      stasiun_asal?: { kodeStasiun?: string; kode_stasiun?: string; namaStasiun?: string; nama_stasiun?: string };
      stasiunTujuan?: { kodeStasiun?: string; kode_stasiun?: string; namaStasiun?: string; nama_stasiun?: string };
      stasiun_tujuan?: { kodeStasiun?: string; kode_stasiun?: string; namaStasiun?: string; nama_stasiun?: string };
    };
  };
  detailTiket?: Penumpang[];
  detail_tiket?: Penumpang[];
}

interface ValidationHistoryItem {
  id: string;
  penumpangNama?: string;
  penumpang_nama?: string;
  penumpangIdentitas?: string;
  penumpang_identitas?: string;
  statusTiket?: string;
  status_tiket?: string;
  createdAt?: string;
  pemesanan?: {
    kodeBooking?: string;
    kode_booking?: string;
  };
  jadwal?: {
    kereta?: {
      namaKereta?: string;
      nama_kereta?: string;
    };
  };
  kursi?: {
    nomorKursi?: string;
    nomor_kursi?: string;
    gerbong?: {
      nomorGerbong?: number | string;
      nomor_gerbong?: number | string;
    };
  };
}

export default function ValidasiPetugasPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth Guard State
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Page State
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingResult | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Digital Clock WIB (Mencegah SSR hydration mismatch)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Client-Side Role Guard
  useEffect(() => {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('railink_user') || sessionStorage.getItem('railink_user') : null;
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setCurrentUserRole(parsed.role || 'PETUGAS');
        if (parsed.role && !['PETUGAS', 'ADMIN'].includes(parsed.role)) {
          router.replace('/login');
          return;
        }
      } else {
        setCurrentUserRole('PETUGAS');
      }
    } catch {
      setCurrentUserRole('PETUGAS');
    } finally {
      setCheckingAuth(false);
    }

    fetchHistory();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [router]);

  // Web Audio Beeper (Efek Suara Gate KAI)
  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // AudioContext fallback
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/petugas/validasi?action=history');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistory(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat validasi:', err);
    }
  };

  const handleSearch = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const query = (directCode || inputCode).trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/petugas/validasi?code=${encodeURIComponent(query)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setBookingData(null);
        setFeedback({
          type: 'error',
          text: json.error || 'Tiket tidak ditemukan dalam jadwal manifest.',
        });
        playBeep('error');
        return;
      }

      setBookingData(json.data);

      const statusBayar = json.data.statusPembayaran || json.data.status_pembayaran;
      const passengerList: Penumpang[] = json.data.detailTiket || json.data.detail_tiket || [];

      if (statusBayar !== 'PAID') {
        setFeedback({
          type: 'error',
          text: `PERINGATAN: Status pembayaran masih ${statusBayar}. Penumpang DILARANG boarding sebelum lunas!`,
        });
        playBeep('error');
      } else {
        const allBoarded = passengerList.length > 0 && passengerList.every(
          (t) => (t.statusTiket || t.status_tiket) === 'BOARDED'
        );
        if (allBoarded) {
          setFeedback({
            type: 'warning',
            text: 'Informasi: Seluruh penumpang pada kode booking ini sudah berstatus BOARDED.',
          });
          playBeep('success');
        } else {
          const trainName = json.data.jadwal?.kereta?.namaKereta || json.data.jadwal?.kereta?.nama_kereta || 'Kereta';
          setFeedback({
            type: 'success',
            text: `Tiket valid (${trainName}). Siap dilakukan boarding.`,
          });
          playBeep('success');
        }
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: 'Terjadi kendala jaringan saat menghubungi server.',
      });
      playBeep('error');
    } finally {
      setLoading(false);
    }
  };

  // Konfirmasi Check-in 1 Penumpang
  const handleBoardSingle = async (detailTiketId: string) => {
    setActionLoadingId(detailTiketId);
    try {
      const res = await fetch('/api/petugas/validasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailTiketId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.error || 'Gagal memproses boarding.' });
        playBeep('error');
        return;
      }

      if (bookingData) {
        const currentList = bookingData.detailTiket || bookingData.detail_tiket || [];
        const updatedDetail = currentList.map(p => 
          p.id === detailTiketId ? { ...p, statusTiket: 'BOARDED' as const, status_tiket: 'BOARDED' as const } : p
        );
        setBookingData({ ...bookingData, detailTiket: updatedDetail, detail_tiket: updatedDetail });
      }

      setFeedback({ type: 'success', text: json.message || 'Check-in berhasil (BOARDED).' });
      playBeep('success');
      fetchHistory();
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghubungi server saat check-in.' });
      playBeep('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Konfirmasi Check-in Seluruh Penumpang dalam Kode Booking
  const handleBoardAll = async () => {
    if (!bookingData) return;
    const kode = bookingData.kodeBooking || bookingData.kode_booking;
    if (!kode) return;

    setActionLoadingId('all');

    try {
      const res = await fetch('/api/petugas/validasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kodeBooking: kode, all: true }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.error || 'Gagal check-in rombongan.' });
        playBeep('error');
        return;
      }

      const currentList = bookingData.detailTiket || bookingData.detail_tiket || [];
      const updatedDetail = currentList.map(p => ({
        ...p,
        statusTiket: 'BOARDED' as const,
        status_tiket: 'BOARDED' as const,
      }));
      setBookingData({ ...bookingData, detailTiket: updatedDetail, detail_tiket: updatedDetail });

      setFeedback({ type: 'success', text: json.message || 'Semua penumpang berhasil boarding!' });
      playBeep('success');
      fetchHistory();
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghubungi server.' });
      playBeep('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Memeriksa hak akses Petugas...</span>
        </div>
      </div>
    );
  }

  const passengerList: Penumpang[] = bookingData ? (bookingData.detailTiket || bookingData.detail_tiket || []) : [];
  const kodeBookingStr = bookingData ? (bookingData.kodeBooking || bookingData.kode_booking || '') : '';
  const statusBayarStr = bookingData ? (bookingData.statusPembayaran || bookingData.status_pembayaran || 'PENDING') : 'PENDING';
  const namaKeretaStr = bookingData?.jadwal?.kereta?.namaKereta || bookingData?.jadwal?.kereta?.nama_kereta || '';
  const stasiunAsalNama = bookingData?.jadwal?.rute?.stasiunAsal?.namaStasiun || bookingData?.jadwal?.rute?.stasiun_asal?.nama_stasiun || '';
  const stasiunAsalKode = bookingData?.jadwal?.rute?.stasiunAsal?.kodeStasiun || bookingData?.jadwal?.rute?.stasiun_asal?.kode_stasiun || '';
  const stasiunTujuanNama = bookingData?.jadwal?.rute?.stasiunTujuan?.namaStasiun || bookingData?.jadwal?.rute?.stasiun_tujuan?.nama_stasiun || '';
  const stasiunTujuanKode = bookingData?.jadwal?.rute?.stasiunTujuan?.kodeStasiun || bookingData?.jadwal?.rute?.stasiun_tujuan?.kode_stasiun || '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Validasi Keberangkatan & Gate Check-In</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Gate Boarding Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pemeriksaan kode booking, identitas KTP/Paspor, dan verifikasi tiket lunas penumpang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-mono text-amber-300">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{currentTime || '12:00:00 WIB'}</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Input Barcode / QR Scanner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" />
            Input Kode Booking / Scan Barcode Tiket
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Pintasan Demo:</span>
            <button
              type="button"
              onClick={() => { setInputCode('KAI-H02JF'); handleSearch(undefined, 'KAI-H02JF'); }}
              className="text-amber-400 hover:underline font-mono"
            >
              KAI-H02JF
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setInputCode('KAI-D58PB'); handleSearch(undefined, 'KAI-D58PB'); }}
              className="text-amber-400 hover:underline font-mono"
            >
              KAI-D58PB
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ketik kode booking (misal: KAI-H02JF) atau arahkan pemindai barcode..."
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Memeriksa...
              </span>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                <span>Cari Tiket</span>
              </>
            )}
          </button>
        </form>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : feedback.type === 'warning'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {feedback.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {feedback.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {feedback.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Ticket Details & Passenger Manifest Card */}
      {bookingData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-6">
          {/* Header Kereta & Status Pembayaran */}
          <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-amber-400 tracking-wider">
                  {kodeBookingStr}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    statusBayarStr === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {statusBayarStr === 'PAID' ? 'LUNAS (PAID)' : 'BELUM LUNAS (PENDING)'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Train className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{namaKeretaStr}</span>
                <span className="text-slate-500">•</span>
                <span>{stasiunAsalNama} ({stasiunAsalKode})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span>{stasiunTujuanNama} ({stasiunTujuanKode})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {statusBayarStr === 'PAID' && (
                <button
                  onClick={handleBoardAll}
                  disabled={actionLoadingId === 'all'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{actionLoadingId === 'all' ? 'Memproses...' : 'Konfirmasi Semua Penumpang'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Passenger Manifest Table */}
          <div className="px-6 pb-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Manifest Penumpang ({passengerList.length} Orang)
            </h3>

            <div className="space-y-3">
              {passengerList.map((p) => {
                const isBoarded = (p.statusTiket || p.status_tiket) === 'BOARDED';
                const namaPenumpang = p.penumpangNama || p.penumpang_nama || 'Penumpang';
                const identitas = p.penumpangIdentitas || p.penumpang_identitas || '-';
                const kursiNo = p.kursi?.nomorKursi || p.kursi?.nomor_kursi || '-';
                const gerbongNo = p.kursi?.gerbong?.nomorGerbong || p.kursi?.gerbong?.nomor_gerbong || '-';
                const kelas = p.kursi?.gerbong?.kelas || '';

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isBoarded
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-mono ${
                          isBoarded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {kursiNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{namaPenumpang}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            NIK: {identitas}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          <span>Gerbong: <strong>{gerbongNo}</strong></span>
                          <span className="mx-2">•</span>
                          <span>Kelas: <strong className="text-amber-400">{kelas}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isBoarded
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isBoarded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>SUDAH BOARDING</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>BELUM BOARDING</span>
                          </>
                        )}
                      </span>

                      {!isBoarded && statusBayarStr === 'PAID' && (
                        <button
                          onClick={() => handleBoardSingle(p.id)}
                          disabled={actionLoadingId === p.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {actionLoadingId === p.id ? 'Memproses...' : 'Check-In'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Validasi Hari Ini */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Riwayat Validasi Boarding Hari Ini
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Divalidasi: <strong className="text-emerald-400">{history.length} Penumpang</strong>
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada data penumpang yang melakukan boarding pada hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kode Booking</th>
                  <th className="py-2.5 px-3">Nama Penumpang</th>
                  <th className="py-2.5 px-3">Identitas (NIK)</th>
                  <th className="py-2.5 px-3">Kereta</th>
                  <th className="py-2.5 px-3">Gerbong / Kursi</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((item) => {
                  const waktuStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID') : 'Hari ini';
                  const kodeBooking = item.pemesanan?.kodeBooking || item.pemesanan?.kode_booking || '-';
                  const nama = item.penumpangNama || item.penumpang_nama || '-';
                  const nik = item.penumpangIdentitas || item.penumpang_identitas || '-';
                  const kereta = item.jadwal?.kereta?.namaKereta || item.jadwal?.kereta?.nama_kereta || '-';
                  const gerbong = item.kursi?.gerbong?.nomorGerbong || item.kursi?.gerbong?.nomor_gerbong || '-';
                  const kursi = item.kursi?.nomorKursi || item.kursi?.nomor_kursi || '-';

                  return (
                    <tr key={item.id} className="hover:bg-slate-950/50">
                      <td className="py-2.5 px-3 text-slate-400">{waktuStr}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{kodeBooking}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">{nama}</td>
                      <td className="py-2.5 px-3 text-slate-400">{nik}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{kereta}</td>
                      <td className="py-2.5 px-3 text-slate-300">{gerbong} / {kursi}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          BOARDED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}