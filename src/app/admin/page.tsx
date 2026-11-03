'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingItem {
  id: string;
  kodeBooking: string;
  totalBayar: number;
  statusPembayaran: string;
  user?: {
    nama: string;
    email: string;
  };
  jadwal?: {
    kereta?: {
      namaKereta: string;
    };
    rute?: {
      stasiunAsal?: { kodeStasiun: string };
      stasiunTujuan?: { kodeStasiun: string };
    };
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'PENDING' | 'PAID' | 'CANCELLED'>('SEMUA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputNama, setInputNama] = useState('');
  const [inputEmail, setInputEmail] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        throw new Error(data.error || 'Format data tidak sesuai');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengambil data dari Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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

  const handleSetPaid = async (item: BookingItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          bookingId: item.id,
          kodeBooking: item.kodeBooking,
          status: 'PAID',
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal mengubah status pembayaran');
      }

      setSuccessMsg(`Tiket ${item.kodeBooking} berhasil diubah ke PAID! Data di Portal Petugas otomatis sinkron.`);
      setBookings((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, statusPembayaran: 'PAID' } : b))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat update status');
    }
  };

  const handleTambahData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {};
      if (inputNama.trim()) payload.nama = inputNama.trim();
      if (inputEmail.trim()) payload.email = inputEmail.trim();

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal menambahkan data ke Supabase');
      }

      setSuccessMsg(`Berhasil! Tiket ${result.data.kodeBooking} atas nama ${result.data.user?.nama || 'Penumpang'} siap digunakan.`);
      setInputNama('');
      setInputEmail('');
      setShowAddModal(false);
      fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghubungkan ke Supabase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === 'SEMUA' || b.statusPembayaran === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      b.kodeBooking.toLowerCase().includes(q) ||
      (b.user?.nama && b.user.nama.toLowerCase().includes(q)) ||
      (b.user?.email && b.user.email.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const totalPesanan = bookings.length;
  const pendingCount = bookings.filter((b) => b.statusPembayaran === 'PENDING').length;
  const paidCount = bookings.filter((b) => b.statusPembayaran === 'PAID').length;
  const totalPendapatan = bookings
    .filter((b) => b.statusPembayaran === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.totalBayar || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-semibold underline ml-4">
              Tutup
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-semibold underline ml-4">
              Tutup
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                ADMIN PANEL
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to Supabase
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kelola Pemesanan & Pembayaran Tiket
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau status tiket penumpang, konfirmasi pembayaran, dan sinkronisasi langsung ke Portal Petugas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
            >
              Refresh Data
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition flex items-center gap-2"
            >
              + Tambah Data ke Supabase
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 shadow-sm transition"
            >
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalPesanan}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Perlu Konfirmasi (Pending)</p>
            <p className="text-3xl font-black text-amber-500 mt-2">{pendingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lunas (Paid)</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{paidCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Pendapatan (Paid)</p>
            <p className="text-2xl font-black text-blue-600 mt-2">
              Rp {totalPendapatan.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Cari kode booking, nama, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {(['SEMUA', 'PENDING', 'PAID', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Kode Booking</th>
                  <th className="py-3.5 px-4">Pemesan</th>
                  <th className="py-3.5 px-4">Kereta & Rute</th>
                  <th className="py-3.5 px-4">Total Bayar</th>
                  <th className="py-3.5 px-4">Status Bayar</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Memuat data dari Supabase...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Tidak ada data pemesanan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isPaid = b.statusPembayaran === 'PAID';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {b.kodeBooking}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {b.user?.nama || 'Penumpang'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {b.user?.email || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">
                            {b.jadwal?.kereta?.namaKereta || 'Taksaka Malam'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {b.jadwal?.rute?.stasiunAsal?.kodeStasiun || 'GMR'} → {b.jadwal?.rute?.stasiunTujuan?.kodeStasiun || 'YK'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          Rp {Number(b.totalBayar || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700'
                                : b.statusPembayaran === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isPaid ? 'PAID (LUNAS)' : b.statusPembayaran}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaid ? (
                            <span className="text-xs font-medium text-slate-400 italic">Selesai</span>
                          ) : (
                            <button
                              onClick={() => handleSetPaid(b)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition"
                            >
                              Ubah ke PAID
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah Data */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tambah Data Pemesanan Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Data yang dibuat akan langsung tersimpan di Supabase dan memiliki tiket boarding untuk Portal Petugas.
                </p>
              </div>

              <form onSubmit={handleTambahData} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Pemesan (Kosongkan untuk nama otomatis acak)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Siti Aminah / Ahmad Fauzi"
                    value={inputNama}
                    onChange={(e) => setInputNama(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Pemesan (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: sitiaminah@gmail.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan ke Supabase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}