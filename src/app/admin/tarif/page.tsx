'use client';

import React, { useState } from 'react';

interface TarifData {
  id: string;
  namaKereta: string;
  kodeKereta: string;
  stasiunAsal: string;
  stasiunTujuan: string;
  kelas: 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI';
  tarifDasar: number;
  biayaLayanan: number;
  status: 'AKTIF' | 'PROMO' | 'PENYESUAIAN';
  terakhirDiubah: string;
}

export default function KelolaTarifPage() {
  const [daftarTarif, setDaftarTarif] = useState<TarifData[]>([
    {
      id: 'TRF-001',
      namaKereta: 'Argo Bromo Anggrek',
      kodeKereta: 'ABA-01',
      stasiunAsal: 'Gambir (GMR)',
      stasiunTujuan: 'Surabaya Pasarturi (SBI)',
      kelas: 'EKSEKUTIF',
      tarifDasar: 550000,
      biayaLayanan: 7500,
      status: 'AKTIF',
      terakhirDiubah: '08 Nov 2026',
    },
    {
      id: 'TRF-002',
      namaKereta: 'Argo Bromo Anggrek',
      kodeKereta: 'ABA-01',
      stasiunAsal: 'Gambir (GMR)',
      stasiunTujuan: 'Surabaya Pasarturi (SBI)',
      kelas: 'BISNIS',
      tarifDasar: 380000,
      biayaLayanan: 7500,
      status: 'AKTIF',
      terakhirDiubah: '08 Nov 2026',
    },
    {
      id: 'TRF-003',
      namaKereta: 'Taksaka Malam',
      kodeKereta: 'TKS-02',
      stasiunAsal: 'Gambir (GMR)',
      stasiunTujuan: 'Yogyakarta (YK)',
      kelas: 'EKSEKUTIF',
      tarifDasar: 420000,
      biayaLayanan: 7500,
      status: 'PROMO',
      terakhirDiubah: '07 Nov 2026',
    },
    {
      id: 'TRF-004',
      namaKereta: 'Matarmaja',
      kodeKereta: 'MTM-05',
      stasiunAsal: 'Pasar Senen (PSE)',
      stasiunTujuan: 'Malang (ML)',
      kelas: 'EKONOMI',
      tarifDasar: 185000,
      biayaLayanan: 5000,
      status: 'AKTIF',
      terakhirDiubah: '05 Nov 2026',
    },
    {
      id: 'TRF-005',
      namaKereta: 'Kertajaya Tambahan',
      kodeKereta: 'KTJ-09',
      stasiunAsal: 'Pasar Senen (PSE)',
      stasiunTujuan: 'Surabaya Pasarturi (SBI)',
      kelas: 'EKONOMI',
      tarifDasar: 210000,
      biayaLayanan: 5000,
      status: 'PENYESUAIAN',
      terakhirDiubah: '04 Nov 2026',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarif, setEditingTarif] = useState<TarifData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    namaKereta: 'Argo Parahyangan',
    kodeKereta: 'APH-03',
    stasiunAsal: 'Gambir (GMR)',
    stasiunTujuan: 'Bandung (BD)',
    kelas: 'EKSEKUTIF' as 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI',
    tarifDasar: 250000,
    biayaLayanan: 7500,
    status: 'AKTIF' as 'AKTIF' | 'PROMO' | 'PENYESUAIAN',
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTarif = daftarTarif.filter((item) => {
    const matchSearch =
      item.namaKereta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kodeKereta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stasiunAsal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stasiunTujuan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = filterKelas === 'SEMUA' || item.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const handleOpenAddModal = () => {
    setEditingTarif(null);
    setFormData({
      namaKereta: '',
      kodeKereta: '',
      stasiunAsal: '',
      stasiunTujuan: '',
      kelas: 'EKSEKUTIF',
      tarifDasar: 200000,
      biayaLayanan: 7500,
      status: 'AKTIF',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TarifData) => {
    setEditingTarif(item);
    setFormData({
      namaKereta: item.namaKereta,
      kodeKereta: item.kodeKereta,
      stasiunAsal: item.stasiunAsal,
      stasiunTujuan: item.stasiunTujuan,
      kelas: item.kelas,
      tarifDasar: item.tarifDasar,
      biayaLayanan: item.biayaLayanan,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKereta || !formData.stasiunAsal || !formData.stasiunTujuan) {
      alert('Mohon lengkapi semua kolom form!');
      return;
    }

    if (editingTarif) {
      setDaftarTarif((prev) =>
        prev.map((t) =>
          t.id === editingTarif.id
            ? {
                ...t,
                ...formData,
                terakhirDiubah: 'Hari ini',
              }
            : t
        )
      );
      showToast(`Tarif ${formData.namaKereta} berhasil diperbarui.`);
    } else {
      const newTarif: TarifData = {
        id: `TRF-00${daftarTarif.length + 1}`,
        ...formData,
        terakhirDiubah: 'Hari ini',
      };
      setDaftarTarif([newTarif, ...daftarTarif]);
      showToast(`Tarif baru ${formData.namaKereta} berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTarif = (id: string, nama: string) => {
    if (confirm(`Yakin ingin menghapus tarif untuk ${nama}?`)) {
      setDaftarTarif((prev) => prev.filter((t) => t.id !== id));
      showToast(`Tarif ${nama} telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🏷️</span> Kelola Tarif Kereta Api
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Atur struktur tarif tiket kereta berdasarkan rute asal, tujuan, dan kelas perjalanan (Kelompok 14).
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <span>+</span> Tambah Tarif Baru
        </button>
      </div>

      {/* Ringkasan Statistik Tarif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Rata-rata Eksekutif</p>
          <p className="text-xl font-black text-amber-400 mt-1">Rp 485.000</p>
          <p className="text-[11px] text-slate-500 mt-1">Termasuk fasilitas lounge & snack</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Rata-rata Bisnis</p>
          <p className="text-xl font-black text-blue-400 mt-1">Rp 340.000</p>
          <p className="text-[11px] text-slate-500 mt-1">Konfigurasi kursi 2-2 reclining</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Rata-rata Ekonomi</p>
          <p className="text-xl font-black text-emerald-400 mt-1">Rp 195.000</p>
          <p className="text-[11px] text-slate-500 mt-1">Kelas PSO & Komersial premium</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Pengaturan Rute</p>
          <p className="text-xl font-black text-white mt-1">{daftarTarif.length} Tarif</p>
          <p className="text-[11px] text-slate-500 mt-1">Semua relasi aktif tersimpan</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kereta, stasiun asal / tujuan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Kelas:</span>
          <div className="flex gap-1.5 overflow-x-auto">
            {['SEMUA', 'EKSEKUTIF', 'BISNIS', 'EKONOMI'].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKelas(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterKelas === k
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Data Tarif */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Kereta Api</th>
                <th className="px-5 py-4">Relasi Rute</th>
                <th className="px-5 py-4">Kelas</th>
                <th className="px-5 py-4">Tarif Dasar</th>
                <th className="px-5 py-4">Biaya Layanan</th>
                <th className="px-5 py-4">Total Tarif Tiket</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTarif.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Tidak ditemukan data tarif yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredTarif.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{t.namaKereta}</div>
                      <div className="text-xs text-amber-400/90 font-mono">{t.kodeKereta}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-200">{t.stasiunAsal}</div>
                      <div className="text-[11px] text-slate-500">↓ Menuju</div>
                      <div className="text-xs text-slate-200">{t.stasiunTujuan}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          t.kelas === 'EKSEKUTIF'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : t.kelas === 'BISNIS'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {t.kelas}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">{formatRupiah(t.tarifDasar)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {formatRupiah(t.biayaLayanan)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-white font-mono text-base">
                        {formatRupiah(t.tarifDasar + t.biayaLayanan)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'AKTIF'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : t.status === 'PROMO'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => handleDeleteTarif(t.id, t.namaKereta)}
                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-bold rounded-lg border border-red-800/40 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Tarif */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span>{editingTarif ? '✏️ Edit Pengaturan Tarif' : '➕ Tambah Tarif Baru'}</span>
            </h2>

            <form onSubmit={handleSaveTarif} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Kereta</label>
                  <input
                    type="text"
                    required
                    value={formData.namaKereta}
                    onChange={(e) => setFormData({ ...formData, namaKereta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Argo Lawu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Kereta</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeKereta}
                    onChange={(e) => setFormData({ ...formData, kodeKereta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: ALW-08"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stasiun Asal</label>
                  <input
                    type="text"
                    required
                    value={formData.stasiunAsal}
                    onChange={(e) => setFormData({ ...formData, stasiunAsal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Gambir (GMR)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stasiun Tujuan</label>
                  <input
                    type="text"
                    required
                    value={formData.stasiunTujuan}
                    onChange={(e) => setFormData({ ...formData, stasiunTujuan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Solo Balapan (SLO)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kelas Kereta</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kelas: e.target.value as 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="EKSEKUTIF">EKSEKUTIF</option>
                    <option value="BISNIS">BISNIS</option>
                    <option value="EKONOMI">EKONOMI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status Tarif</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'AKTIF' | 'PROMO' | 'PENYESUAIAN',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="PROMO">PROMO</option>
                    <option value="PENYESUAIAN">PENYESUAIAN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tarif Dasar (Rp)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={1000}
                    value={formData.tarifDasar}
                    onChange={(e) =>
                      setFormData({ ...formData, tarifDasar: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Biaya Layanan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={formData.biayaLayanan}
                    onChange={(e) =>
                      setFormData({ ...formData, biayaLayanan: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Tarif per Kursi:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatRupiah(formData.tarifDasar + formData.biayaLayanan)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}