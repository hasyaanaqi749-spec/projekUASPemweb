// src/app/admin/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Overview Dashboard Admin & 4 Card Status Ringkasan Operasional
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  MapPin, 
  Train, 
  DollarSign, 
  Ticket,
  ChevronRight
} from 'lucide-react';

interface BookingItem {
  id: string;
  kodeBooking: string;
  pemesanNama: string;
  pemesanEmail: string;
  namaKereta: string;
  rute: string;
  totalBayar: number;
  statusPembayaran: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

interface AdminStats {
  totalPesanan: number;
  totalStasiun: number;
  keretaAktif: number;
  totalPendapatan: number;
  pendingCount: number;
  paidCount: number;
}

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalPesanan: 10,
    totalStasiun: 8,
    keretaAktif: 3,
    totalPendapatan: 5500000,
    pendingCount: 2,
    paidCount: 8,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'SEMUA' | 'PENDING' | 'PAID' | 'CANCELLED'>('SEMUA');
  const [alertSuccess, setAlertSuccess] = useState<string>('');

  // 1. Fetch Data Pemesanan dari API Backend Supabase
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) {
          setBookings(data.bookings);
          setStats((prev) => ({
            ...prev,
            totalPesanan: data.stats.totalPesanan,
            pendingCount: data.stats.pendingCount,
            paidCount: data.stats.paidCount,
            totalPendapatan: data.stats.totalPendapatan,
          }));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. Fungsi Konfirmasi Pembayaran Menjadi PAID
  const handleUpdateStatusToPaid = async (kodeBooking: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kodeBooking, statusPembayaran: 'PAID' }),
      });

      if (res.ok) {
        setAlertSuccess(`Tiket ${kodeBooking} berhasil diubah ke PAID! Data di Portal Petugas otomatis sinkron.`);
        setTimeout(() => setAlertSuccess(''), 4000);
        fetchAdminData();
      } else {
        alert('Gagal mengubah status.');
      }
    } catch (e) {
      alert('Terjadi kendala jaringan.');
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredBookings = bookings.filter((item) => {
    const matchesSearch =
      item.kodeBooking.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.pemesanNama.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.pemesanEmail.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;
    if (statusTab === 'SEMUA') return true;
    return item.statusPembayaran === statusTab;
  });

  return (
    <div className="space-y-8">
      
      {/* NOTIFIKASI SUKSES */}
      {alertSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
          <button onClick={() => setAlertSuccess('')} className="text-emerald-700 font-black text-xs cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* HEADER OVERVIEW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              SISTEM INFORMASI KAI
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ● Database Supabase Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Utama Administrator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan metrik operasional kereta, stasiun, rute, dan rekonsiliasi pembayaran tiket real-time.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-xs w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrik</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4 CARD STATUS RINGKASAN SESUAI KEBUTUHAN UAS                          */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: TOTAL PEMESANAN */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemesanan</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalPesanan}</span>
            <span className="text-xs font-semibold text-slate-400">Tiket Terdaftar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.paidCount} Lunas • {stats.pendingCount} Menunggu Bayar
          </p>
        </div>

        {/* CARD 2: TOTAL STASIUN */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stasiun</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalStasiun}</span>
            <span className="text-xs font-semibold text-slate-400">Stasiun Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Terhubung di seluruh Pulau Jawa (GMR, YK, SGU, dll.)
          </p>
        </div>

        {/* CARD 3: KERETA AKTIF */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kereta Aktif</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Train className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.keretaAktif}</span>
            <span className="text-xs font-semibold text-slate-400">Rangkaian KA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Taksaka, Argo Bromo Anggrek, Senja Utama
          </p>
        </div>

        {/* CARD 4: PENDAPATAN (OMZET LUNAS) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight block">
            {formatRupiah(stats.totalPendapatan)}
          </span>
          <p className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dari {stats.paidCount} Transaksi Berstatus PAID</span>
          </p>
        </div>

      </div>

      {/* FILTER & TABEL PEMESANAN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Daftar Riwayat Transaksi Pemesanan
            </h2>
            <p className="text-xs text-slate-500">
              Sinkronisasi data langsung dengan tabel pemesanan &amp; detail tiket di Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode booking, nama..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['SEMUA', 'PENDING', 'PAID'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    statusTab === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Pemesan</th>
                <th className="py-3 px-4">Kereta &amp; Rute</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data transaksi dari Supabase...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-blue-600">
                      {b.kodeBooking}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{b.pemesanNama}</p>
                      <p className="text-[11px] text-slate-400">{b.pemesanEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{b.namaKereta}</p>
                      <p className="text-[11px] text-slate-400">{b.rute}</p>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatRupiah(b.totalBayar)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        b.statusPembayaran === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.statusPembayaran === 'PAID' ? 'PAID (LUNAS)' : b.statusPembayaran}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.statusPembayaran === 'PENDING' ? (
                        <button
                          onClick={() => handleUpdateStatusToPaid(b.kodeBooking)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          Ubah ke PAID
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}