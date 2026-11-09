// src/app/admin/jadwal/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Manajemen Master Rute, Jadwal Keberangkatan, & Tarif Kereta Api
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Train, 
  MapPin, 
  Clock, 
  Banknote, 
  Filter, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface StasiunOption {
  id: string;
  kode: string;
  nama: string;
  kota: string;
}

interface KeretaOption {
  id: string;
  kode: string;
  nama: string;
}

interface JadwalItem {
  id: string;
  kereta: KeretaOption;
  stasiunAsal: StasiunOption;
  stasiunTujuan: StasiunOption;
  waktuBerangkat: string; // ISO string
  waktuTiba: string;      // ISO string
  tarif: {
    eksekutif?: number;
    bisnis?: number;
    ekonomi?: number;
  };
}

const DEFAULT_STATIONS: StasiunOption[] = [
  { id: 'st-01', kode: 'GMR', nama: 'Gambir', kota: 'Jakarta Pusat' },
  { id: 'st-02', kode: 'PSE', nama: 'Pasar Senen', kota: 'Jakarta Pusat' },
  { id: 'st-03', kode: 'BD', nama: 'Bandung', kota: 'Bandung' },
  { id: 'st-04', kode: 'CN', nama: 'Cirebon', kota: 'Cirebon' },
  { id: 'st-05', kode: 'SMT', nama: 'Semarang Tawang', kota: 'Semarang' },
  { id: 'st-06', kode: 'YK', nama: 'Yogyakarta (Tugu)', kota: 'Yogyakarta' },
  { id: 'st-07', kode: 'SLO', nama: 'Solo Balapan', kota: 'Surakarta' },
  { id: 'st-08', kode: 'SGU', nama: 'Surabaya Gubeng', kota: 'Surabaya' },
];

const DEFAULT_TRAINS: KeretaOption[] = [
  { id: 'ka-01', kode: 'KA-67', nama: 'Taksaka' },
  { id: 'ka-02', kode: 'KA-1', nama: 'Argo Bromo Anggrek' },
  { id: 'ka-03', kode: 'KA-92', nama: 'Lodaya' },
  { id: 'ka-04', kode: 'KA-134', nama: 'Senja Utama Solo' },
];

const INITIAL_SCHEDULES: JadwalItem[] = [
  {
    id: 'sch-01',
    kereta: DEFAULT_TRAINS[0], // Taksaka
    stasiunAsal: DEFAULT_STATIONS[0], // Gambir
    stasiunTujuan: DEFAULT_STATIONS[5], // Yogyakarta
    waktuBerangkat: '2026-11-09T20:45:00.000Z',
    waktuTiba: '2026-11-10T03:30:00.000Z',
    tarif: { eksekutif: 550000, bisnis: 380000 },
  },
  {
    id: 'sch-02',
    kereta: DEFAULT_TRAINS[1], // Argo Bromo Anggrek
    stasiunAsal: DEFAULT_STATIONS[0], // Gambir
    stasiunTujuan: DEFAULT_STATIONS[7], // Surabaya Gubeng
    waktuBerangkat: '2026-11-09T08:00:00.000Z',
    waktuTiba: '2026-11-09T16:15:00.000Z',
    tarif: { eksekutif: 650000 },
  },
  {
    id: 'sch-03',
    kereta: DEFAULT_TRAINS[2], // Lodaya
    stasiunAsal: DEFAULT_STATIONS[2], // Bandung
    stasiunTujuan: DEFAULT_STATIONS[6], // Solo Balapan
    waktuBerangkat: '2026-11-08T07:05:00.000Z',
    waktuTiba: '2026-11-08T15:20:00.000Z',
    tarif: { eksekutif: 420000, ekonomi: 250000 },
  },
];

export default function MasterJadwalPage() {
  const [schedules, setSchedules] = useState<JadwalItem[]>(INITIAL_SCHEDULES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKereta, setFilterKereta] = useState<string>('SEMUA');
  const [filterStasiunAsal, setFilterStasiunAsal] = useState<string>('SEMUA');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Form State Jadwal Baru
  const [selectedKeretaId, setSelectedKeretaId] = useState<string>(DEFAULT_TRAINS[0].id);
  const [asalId, setAsalId] = useState<string>(DEFAULT_STATIONS[0].id);
  const [tujuanId, setTujuanId] = useState<string>(DEFAULT_STATIONS[5].id);
  const [waktuBerangkatInput, setWaktuBerangkatInput] = useState<string>('2026-11-10T08:00');
  const [waktuTibaInput, setWaktuTibaInput] = useState<string>('2026-11-10T14:30');

  // Tarif Per Kelas
  const [tarifEksekutif, setTarifEksekutif] = useState<number>(550000);
  const [tarifBisnis, setTarifBisnis] = useState<number>(380000);
  const [tarifEkonomi, setTarifEkonomi] = useState<number>(220000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenModal = () => {
    setModalError('');
    setIsModalOpen(true);
  };

  // Submit Jadwal Baru
  const handleSubmitJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    // 1. Validasi Stasiun Asal != Stasiun Tujuan
    if (asalId === tujuanId) {
      setModalError('Stasiun asal dan stasiun tujuan tidak boleh sama.');
      return;
    }

    // 2. Validasi Waktu Tiba harus setelah Waktu Berangkat
    const dBerangkat = new Date(waktuBerangkatInput);
    const dTiba = new Date(waktuTibaInput);
    if (dTiba <= dBerangkat) {
      setModalError('Waktu estimasi tiba harus lebih akhir daripada waktu keberangkatan.');
      return;
    }

    const keretaObj = DEFAULT_TRAINS.find((k) => k.id === selectedKeretaId) || DEFAULT_TRAINS[0];
    const asalObj = DEFAULT_STATIONS.find((s) => s.id === asalId) || DEFAULT_STATIONS[0];
    const tujuanObj = DEFAULT_STATIONS.find((s) => s.id === tujuanId) || DEFAULT_STATIONS[5];

    const newJadwal: JadwalItem = {
      id: `sch-${Date.now()}`,
      kereta: keretaObj,
      stasiunAsal: asalObj,
      stasiunTujuan: tujuanObj,
      waktuBerangkat: dBerangkat.toISOString(),
      waktuTiba: dTiba.toISOString(),
      tarif: {
        eksekutif: tarifEksekutif > 0 ? tarifEksekutif : undefined,
        bisnis: tarifBisnis > 0 ? tarifBisnis : undefined,
        ekonomi: tarifEkonomi > 0 ? tarifEkonomi : undefined,
      },
    };

    setSchedules([newJadwal, ...schedules]);
    showToast(`Jadwal baru ${keretaObj.nama} (${asalObj.kode} → ${tujuanObj.kode}) berhasil diterbitkan.`);
    setIsModalOpen(false);
  };

  const handleDeleteJadwal = (id: string, label: string) => {
    if (confirm(`Hapus jadwal perjalanan ${label}?`)) {
      setSchedules(schedules.filter((s) => s.id !== id));
      showToast(`Jadwal berhasil dihapus.`);
    }
  };

  // 3. Helper Penentu Status Jadwal (Akan Datang, Berjalan, Selesai)
  const getJadwalStatus = (waktuBerangkat: string, waktuTiba: string) => {
    const now = new Date().getTime();
    const berangkat = new Date(waktuBerangkat).getTime();
    const tiba = new Date(waktuTiba).getTime();

    if (now < berangkat) {
      return {
        label: 'Akan Datang',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-600',
      };
    } else if (now >= berangkat && now <= tiba) {
      return {
        label: 'Sedang Berjalan',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse',
        dot: 'bg-emerald-600',
      };
    } else {
      return {
        label: 'Selesai',
        classes: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
    }
  };

  const formatRupiah = (val?: number) => {
    if (!val) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        tgl: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        jam: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
    } catch {
      return { tgl: '-', jam: '--:--' };
    }
  };

  // Filter List Jadwal
  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch =
      item.kereta.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kereta.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stasiunAsal.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stasiunTujuan.nama.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterKereta !== 'SEMUA' && item.kereta.nama !== filterKereta) return false;
    if (filterStasiunAsal !== 'SEMUA' && item.stasiunAsal.kode !== filterStasiunAsal) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER PAGE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              OPERASIONAL JADWAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-7 h-7 text-blue-600" />
            <span>Manajemen Rute, Jadwal &amp; Tarif</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola rute keberangkatan stasiun, estimasi waktu tempuh, status perjalanan kereta, dan harga tiket per kelas.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer w-fit active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Jadwal Baru</span>
        </button>
      </div>

      {/* TOOLBAR FILTER & SEARCH */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kereta, rute, stasiun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kereta:</span>
            <select
              value={filterKereta}
              onChange={(e) => setFilterKereta(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="SEMUA">Semua Kereta</option>
              {DEFAULT_TRAINS.map((t) => (
                <option key={t.id} value={t.nama}>{t.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <span>Stasiun Asal:</span>
            <select
              value={filterStasiunAsal}
              onChange={(e) => setFilterStasiunAsal(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="SEMUA">Semua Stasiun</option>
              {DEFAULT_STATIONS.map((s) => (
                <option key={s.id} value={s.kode}>{s.nama} ({s.kode})</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* TABEL DAFTAR JADWAL AKTIF */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-4">Kereta Api</th>
                <th className="py-4 px-4">Rute Perjalanan</th>
                <th className="py-4 px-4">Jadwal Keberangkatan</th>
                <th className="py-4 px-4">Tarif Tiket Per Kelas</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada jadwal perjalanan kereta yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((item) => {
                  const status = getJadwalStatus(item.waktuBerangkat, item.waktuTiba);
                  const berangkat = formatDateTime(item.waktuBerangkat);
                  const tiba = formatDateTime(item.waktuTiba);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Kereta Api */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {item.kereta.kode}
                          </span>
                          <span className="font-black text-slate-900">{item.kereta.nama}</span>
                        </div>
                      </td>

                      {/* Rute Perjalanan */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{item.stasiunAsal.nama} ({item.stasiunAsal.kode})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.stasiunTujuan.nama} ({item.stasiunTujuan.kode})</span>
                        </div>
                      </td>

                      {/* Waktu Berangkat & Tiba */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">
                            {berangkat.tgl} • <span className="text-blue-600 font-black">{berangkat.jam} WIB</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Tiba: {tiba.tgl} • {tiba.jam} WIB
                          </p>
                        </div>
                      </td>

                      {/* Tarif Per Kelas */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.tarif.eksekutif && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                              Eks: {formatRupiah(item.tarif.eksekutif)}
                            </span>
                          )}
                          {item.tarif.bisnis && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                              Bis: {formatRupiah(item.tarif.bisnis)}
                            </span>
                          )}
                          {item.tarif.ekonomi && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                              Eko: {formatRupiah(item.tarif.ekonomi)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${status.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Aksi Hapus */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteJadwal(item.id, `${item.kereta.nama} (${item.stasiunAsal.kode}→${item.stasiunTujuan.kode})`)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL FORM PENERBITAN JADWAL & TARIF BARU                           */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Terbitkan Jadwal Kereta Baru</h3>
                <p className="text-xs text-slate-500">Tentukan rute, jam tempuh, dan acuan tarif perjalanan.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitJadwal} className="space-y-4">
              
              {/* 1. Pilih Kereta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Pilih Rangkaian Kereta *
                </label>
                <select
                  value={selectedKeretaId}
                  onChange={(e) => setSelectedKeretaId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {DEFAULT_TRAINS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.kode})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Pilih Stasiun Asal & Tujuan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Stasiun Asal *
                  </label>
                  <select
                    value={asalId}
                    onChange={(e) => setAsalId(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {DEFAULT_STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Stasiun Tujuan *
                  </label>
                  <select
                    value={tujuanId}
                    onChange={(e) => setTujuanId(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {DEFAULT_STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Waktu Berangkat & Tiba */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Waktu Berangkat *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={waktuBerangkatInput}
                    onChange={(e) => setWaktuBerangkatInput(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Estimasi Tiba *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={waktuTibaInput}
                    onChange={(e) => setWaktuTibaInput(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 4. Form Tarif Per Kelas (Rupiah) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Pengaturan Tarif Tiket (Rupiah)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">
                      Kelas Eksekutif
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={tarifEksekutif}
                      onChange={(e) => setTarifEksekutif(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-800 mb-1">
                      Kelas Bisnis
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={tarifBisnis}
                      onChange={(e) => setTarifBisnis(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                      Kelas Ekonomi
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={tarifEkonomi}
                      onChange={(e) => setTarifEkonomi(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Terbitkan Jadwal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}