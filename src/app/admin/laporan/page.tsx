'use client';

import React, { useState } from 'react';

interface PemesananItem {
  id: string;
  kodeBooking: string;
  penumpangNama: string;
  identitas: string;
  keretaNama: string;
  rute: string;
  kelas: string;
  kursi: string;
  tanggalWaktu: string;
  totalBayar: number;
  metodePembayaran: string;
  statusPembayaran: 'PAID' | 'PENDING' | 'CANCELLED';
}

export default function LaporanPemesananPage() {
  const [dataPemesanan] = useState<PemesananItem[]>([
    {
      id: 'ORD-101',
      kodeBooking: 'RLK-98213',
      penumpangNama: 'Budi Santoso',
      identitas: '3201234567890001',
      keretaNama: 'Argo Bromo Anggrek',
      rute: 'Gambir (GMR) → Surabaya Pasarturi (SBI)',
      kelas: 'Eksekutif (EKS-1)',
      kursi: '4A',
      tanggalWaktu: '09 Nov 2026, 08:30 WIB',
      totalBayar: 557500,
      metodePembayaran: 'QRIS',
      statusPembayaran: 'PAID',
    },
    {
      id: 'ORD-102',
      kodeBooking: 'RLK-77120',
      penumpangNama: 'Siti Aminah',
      identitas: '3302987654320002',
      keretaNama: 'Taksaka Malam',
      rute: 'Gambir (GMR) → Yogyakarta (YK)',
      kelas: 'Eksekutif (EKS-2)',
      kursi: '7C',
      tanggalWaktu: '09 Nov 2026, 09:15 WIB',
      totalBayar: 427500,
      metodePembayaran: 'Virtual Account BCA',
      statusPembayaran: 'PAID',
    },
    {
      id: 'ORD-103',
      kodeBooking: 'RLK-65491',
      penumpangNama: 'Ahmad Fauzi',
      identitas: '3504123456780003',
      keretaNama: 'Matarmaja',
      rute: 'Pasar Senen (PSE) → Malang (ML)',
      kelas: 'Ekonomi (EKO-1)',
      kursi: '12B',
      tanggalWaktu: '09 Nov 2026, 10:00 WIB',
      totalBayar: 190000,
      metodePembayaran: 'Mandiri Livin',
      statusPembayaran: 'PAID',
    },
    {
      id: 'ORD-104',
      kodeBooking: 'RLK-44219',
      penumpangNama: 'Dewi Lestari',
      identitas: '3171098765430004',
      keretaNama: 'Argo Parahyangan',
      rute: 'Gambir (GMR) → Bandung (BD)',
      kelas: 'Bisnis (BIS-1)',
      kursi: '2D',
      tanggalWaktu: '09 Nov 2026, 11:20 WIB',
      totalBayar: 257500,
      metodePembayaran: 'QRIS',
      statusPembayaran: 'PENDING',
    },
    {
      id: 'ORD-105',
      kodeBooking: 'RLK-11082',
      penumpangNama: 'Reza Rahardian',
      identitas: '3273112233440005',
      keretaNama: 'Kertajaya Tambahan',
      rute: 'Pasar Senen (PSE) → Surabaya Pasarturi (SBI)',
      kelas: 'Ekonomi (EKO-2)',
      kursi: '9A',
      tanggalWaktu: '09 Nov 2026, 12:45 WIB',
      totalBayar: 215000,
      metodePembayaran: 'Indomaret / Alfamart',
      statusPembayaran: 'CANCELLED',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredData = dataPemesanan.filter((item) => {
    const matchStatus = filterStatus === 'SEMUA' || item.statusPembayaran === filterStatus;
    const matchSearch =
      item.kodeBooking.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.penumpangNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keretaNama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPendapatanLunas = dataPemesanan
    .filter((d) => d.statusPembayaran === 'PAID')
    .reduce((acc, curr) => acc + curr.totalBayar, 0);

  const totalTiketLunas = dataPemesanan.filter((d) => d.statusPembayaran === 'PAID').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Laporan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>📊</span> Laporan Pemesanan & Keuangan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rekapitulasi penjualan tiket kereta api dan status transaksi penumpang (Railink Kelompok 14).
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-lg"
          >
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Pendapatan Terverifikasi</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {formatRupiah(totalPendapatanLunas)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Dari {totalTiketLunas} pesanan berstatus PAID</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Tiket Terjual</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{totalTiketLunas} Kursi</p>
          <p className="text-[11px] text-slate-500 mt-1">Hari ini (09 Nov 2026)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Tingkat Okupansi Kursi</p>
          <p className="text-2xl font-black text-blue-400 mt-1">88.5%</p>
          <p className="text-[11px] text-slate-500 mt-1">Target harian 85% tercapai</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Metode Terfavorit</p>
          <p className="text-2xl font-black text-purple-400 mt-1">QRIS (60%)</p>
          <p className="text-[11px] text-slate-500 mt-1">Disusul Virtual Account BCA</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking atau nama penumpang..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Status:</span>
          <div className="flex gap-1.5 overflow-x-auto">
            {['SEMUA', 'PAID', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === st
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Data Pemesanan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Kode Booking</th>
                <th className="px-5 py-4">Nama Penumpang</th>
                <th className="px-5 py-4">Kereta & Rute</th>
                <th className="px-5 py-4">Gerbong / Kursi</th>
                <th className="px-5 py-4">Total Bayar</th>
                <th className="px-5 py-4">Metode</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada catatan transaksi pemesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredData.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        {order.kodeBooking}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{order.tanggalWaktu}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{order.penumpangNama}</div>
                      <div className="text-xs text-slate-500 font-mono">NIK: {order.identitas}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-slate-200">{order.keretaNama}</div>
                      <div className="text-[11px] text-slate-400">{order.rute}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-300 font-mono font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {order.kursi} ({order.kelas})
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {formatRupiah(order.totalBayar)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{order.metodePembayaran}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          order.statusPembayaran === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : order.statusPembayaran === 'PENDING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {order.statusPembayaran === 'PAID'
                          ? 'Lunas'
                          : order.statusPembayaran === 'PENDING'
                          ? 'Menunggu'
                          : 'Batal'}
                      </span>
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