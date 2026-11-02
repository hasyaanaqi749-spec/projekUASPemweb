'use client';

import { logoutAction } from '@/app/actions/authActions';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
  };

  const latestBookings = [
    {
      id: '1',
      kodeBooking: 'KAI-L7812A',
      user: { nama: 'Budi Santoso', email: 'budi@example.com' },
      jadwal: {
        kereta: { namaKereta: 'Taksaka Malam' },
        rute: { stasiunAsal: { kodeStasiun: 'GMR' }, stasiunTujuan: { kodeStasiun: 'YK' } },
      },
      totalBayar: 550000,
      statusPembayaran: 'PAID',
    },
    {
      id: '2',
      kodeBooking: 'KAI-P4491X',
      user: { nama: 'Siti Rahmawati', email: 'siti@example.com' },
      jadwal: {
        kereta: { namaKereta: 'Argo Bromo Anggrek' },
        rute: { stasiunAsal: { kodeStasiun: 'GMR' }, stasiunTujuan: { kodeStasiun: 'SGU' } },
      },
      totalBayar: 750000,
      statusPembayaran: 'PENDING',
    },
    {
      id: '3',
      kodeBooking: 'KAI-B9011Z',
      user: { nama: 'Ahmad Fauzi', email: 'ahmad@example.com' },
      jadwal: {
        kereta: { namaKereta: 'Argo Parahyangan' },
        rute: { stasiunAsal: { kodeStasiun: 'GMR' }, stasiunTujuan: { kodeStasiun: 'BD' } },
      },
      totalBayar: 200000,
      statusPembayaran: 'CANCELLED',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navbar Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                ROLE: ADMIN PUSAT
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Worker BullMQ Active
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mt-2">Dashboard Operasional LajuRel</h1>
            <p className="text-slate-400 text-sm">Monitoring Jadwal, Kursi Kereta, dan Transaksi Penumpang</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-colors text-white"
            >
              Lihat Web Penumpang ➔
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-sm font-semibold transition-colors cursor-pointer"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        {/* 4 Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Jadwal Rute</p>
            <h2 className="text-3xl font-black text-white mt-2">6 Jadwal</h2>
            <p className="text-xs text-slate-500 mt-1">Stasiun Gambir - Yogyakarta</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Tiket Dipesan</p>
            <h2 className="text-3xl font-black text-orange-400 mt-2">12 Transaksi</h2>
            <p className="text-xs text-slate-500 mt-1">PostgreSQL Supabase</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pengguna Terdaftar</p>
            <h2 className="text-3xl font-black text-blue-400 mt-2">3 Akun Demo</h2>
            <p className="text-xs text-slate-500 mt-1">Admin, Petugas, Penumpang</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Infrastruktur Queue</p>
            <h2 className="text-xl font-bold text-emerald-400 mt-2">Upstash Redis</h2>
            <p className="text-xs text-slate-500 mt-1">Auto-sweep 15 Menit</p>
          </div>
        </div>

        {/* Tabel Pemesanan Terkini */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Daftar Transaksi Tiket Terkini</h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Live Realtime Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Kode Booking</th>
                  <th className="py-3.5 px-5">Penumpang</th>
                  <th className="py-3.5 px-5">Kereta & Rute</th>
                  <th className="py-3.5 px-5">Total Tarif</th>
                  <th className="py-3.5 px-5">Status Tiket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {latestBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-orange-400">
                      {b.kodeBooking}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{b.user.nama}</div>
                      <div className="text-xs text-slate-500">{b.user.email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-white font-medium">{b.jadwal.kereta.namaKereta}</div>
                      <div className="text-xs text-slate-400">
                        {b.jadwal.rute.stasiunAsal.kodeStasiun} ➔ {b.jadwal.rute.stasiunTujuan.kodeStasiun}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-white">
                      Rp {Number(b.totalBayar).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          b.statusPembayaran === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : b.statusPembayaran === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {b.statusPembayaran}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}