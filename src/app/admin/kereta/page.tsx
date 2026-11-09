// src/app/admin/kereta/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Manajemen Master Kereta, Tambah Gerbong & Layout Kursi Otomatis
// ========================================================================

'use client';

import React, { useState } from 'react';
import { 
  Train, 
  Layers, 
  Plus, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Eye, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface GerbongItem {
  id: string;
  nomorGerbong: number;
  namaGerbong: string;
  kelas: 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI';
  totalKursi: number;
}

interface KeretaItem {
  id: string;
  kodeKereta: string;
  namaKereta: string;
  gerbong: GerbongItem[];
}

const INITIAL_TRAINS: KeretaItem[] = [
  {
    id: 'k-1',
    kodeKereta: 'KA-67',
    namaKereta: 'Taksaka',
    gerbong: [
      { id: 'gb-1', nomorGerbong: 1, namaGerbong: 'Eksekutif 1', kelas: 'EKSEKUTIF', totalKursi: 40 },
      { id: 'gb-2', nomorGerbong: 2, namaGerbong: 'Eksekutif 2', kelas: 'EKSEKUTIF', totalKursi: 40 },
      { id: 'gb-3', nomorGerbong: 3, namaGerbong: 'Bisnis 1', kelas: 'BISNIS', totalKursi: 48 },
    ],
  },
  {
    id: 'k-2',
    kodeKereta: 'KA-1',
    namaKereta: 'Argo Bromo Anggrek',
    gerbong: [
      { id: 'gb-4', nomorGerbong: 1, namaGerbong: 'Eksekutif 1', kelas: 'EKSEKUTIF', totalKursi: 40 },
      { id: 'gb-5', nomorGerbong: 2, namaGerbong: 'Eksekutif 2', kelas: 'EKSEKUTIF', totalKursi: 40 },
    ],
  },
  {
    id: 'k-3',
    kodeKereta: 'KA-92',
    namaKereta: 'Lodaya',
    gerbong: [
      { id: 'gb-6', nomorGerbong: 1, namaGerbong: 'Eksekutif 1', kelas: 'EKSEKUTIF', totalKursi: 40 },
      { id: 'gb-7', nomorGerbong: 2, namaGerbong: 'Ekonomi 1', kelas: 'EKONOMI', totalKursi: 64 },
    ],
  },
];

export default function MasterKeretaPage() {
  const [trains, setTrains] = useState<KeretaItem[]>(INITIAL_TRAINS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrain, setSelectedTrain] = useState<KeretaItem | null>(null);

  // Modal Tambah Gerbong Baru
  const [isAddGerbongOpen, setIsAddGerbongOpen] = useState<boolean>(false);
  const [targetTrainId, setTargetTrainId] = useState<string | null>(null);
  const [gerbongForm, setGerbongForm] = useState({
    namaGerbong: 'Eksekutif 3',
    nomorGerbong: 3,
    kelas: 'EKSEKUTIF' as 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI',
    totalBaris: 10, // 10 baris x 4 kursi (A, B, C, D) = 40 kursi otomatis
  });

  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Open Modal Tambah Gerbong
  const handleOpenAddGerbong = (train: KeretaItem) => {
    setTargetTrainId(train.id);
    const nextNomor = train.gerbong.length + 1;
    setGerbongForm({
      namaGerbong: `Eksekutif ${nextNomor}`,
      nomorGerbong: nextNomor,
      kelas: 'EKSEKUTIF',
      totalBaris: 10,
    });
    setIsAddGerbongOpen(true);
  };

  // Submit Penambahan Gerbong & Generate Kursi Otomatis
  const handleSubmitGerbong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTrainId) return;

    const totalKursiGenerated = gerbongForm.totalBaris * 4; // Layout 2-2: A, B, C, D

    const newGerbongItem: GerbongItem = {
      id: `gb-${Date.now()}`,
      nomorGerbong: Number(gerbongForm.nomorGerbong),
      namaGerbong: gerbongForm.namaGerbong,
      kelas: gerbongForm.kelas,
      totalKursi: totalKursiGenerated,
    };

    setTrains((prev) =>
      prev.map((t) => {
        if (t.id === targetTrainId) {
          const updated = { ...t, gerbong: [...t.gerbong, newGerbongItem] };
          if (selectedTrain?.id === t.id) setSelectedTrain(updated);
          return updated;
        }
        return t;
      })
    );

    showToast(
      `Berhasil menambahkan ${gerbongForm.namaGerbong} (${totalKursiGenerated} kursi 1A–${gerbongForm.totalBaris}D otomatis digenerate)!`
    );
    setIsAddGerbongOpen(false);
  };

  const filteredTrains = trains.filter(
    (t) =>
      t.namaKereta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kodeKereta.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER PAGE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              MASTER KERETA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Train className="w-7 h-7 text-blue-600" />
            <span>Master Kereta &amp; Rangkaian Gerbong</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola armada lokomotif kereta api, rangkaian unit gerbong, serta generator layout nomor kursi (1A–10D).
          </p>
        </div>
      </div>

      {/* SEARCH BAR & DAFTAR KERETA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI: DAFTAR KERETA */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 pb-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode / nama kereta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredTrains.map((train) => {
              const totalKapasitas = train.gerbong.reduce((acc, curr) => acc + curr.totalKursi, 0);
              const isSelected = selectedTrain?.id === train.id;

              return (
                <div
                  key={train.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {train.kodeKereta}
                        </span>
                        <h3 className="text-base font-black text-slate-900">{train.namaKereta}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {train.gerbong.length} Unit Gerbong • Total Kapasitas {totalKapasitas} Kursi
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTrain(train)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Gerbong</span>
                      </button>

                      <button
                        onClick={() => handleOpenAddGerbong(train)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Gerbong</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL RANGKAIAN GERBONG DARI KERETA TERPILIH */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {selectedTrain ? `Susunan Gerbong: ${selectedTrain.namaKereta}` : 'Detail Rangkaian Gerbong'}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedTrain ? `Kode: ${selectedTrain.kodeKereta}` : 'Pilih salah satu kereta di sebelah kiri.'}
              </p>
            </div>
            {selectedTrain && (
              <button
                onClick={() => handleOpenAddGerbong(selectedTrain)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            )}
          </div>

          {!selectedTrain ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Klik tombol &quot;Lihat Gerbong&quot; pada salah satu kereta.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTrain.gerbong.map((gb) => (
                <div
                  key={gb.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                      #{gb.nomorGerbong}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{gb.namaGerbong}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        gb.kelas === 'EKSEKUTIF'
                          ? 'bg-amber-100 text-amber-800'
                          : gb.kelas === 'BISNIS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {gb.kelas}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-slate-900 block">
                      {gb.totalKursi} Kursi
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Layout 2-2 Otomatis
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* =================================================================== */}
      {/* MODAL FORM TAMBAH GERBONG & GENERATE KURSI                          */}
      {/* =================================================================== */}
      {isAddGerbongOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Tambah Unit Gerbong</h3>
                <p className="text-xs text-slate-500">Auto-generate denah kursi 1A–10D.</p>
              </div>
              <button
                onClick={() => setIsAddGerbongOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGerbong} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nama Gerbong *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Eksekutif 3"
                  value={gerbongForm.namaGerbong}
                  onChange={(e) => setGerbongForm({ ...gerbongForm, namaGerbong: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Nomor Urut Gerbong
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={gerbongForm.nomorGerbong}
                    onChange={(e) => setGerbongForm({ ...gerbongForm, nomorGerbong: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Kelas Layanan
                  </label>
                  <select
                    value={gerbongForm.kelas}
                    onChange={(e) => setGerbongForm({ ...gerbongForm, kelas: e.target.value as any })}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="EKSEKUTIF">EKSEKUTIF</option>
                    <option value="BISNIS">BISNIS</option>
                    <option value="EKONOMI">EKONOMI</option>
                  </select>
                </div>
              </div>

              {/* Generator Kursi */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Generator Denah Kursi (Layout 2-2)
                  </span>
                  <span>{gerbongForm.totalBaris * 4} Kursi</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600">Jumlah Baris:</label>
                  <input
                    type="range"
                    min={5}
                    max={16}
                    value={gerbongForm.totalBaris}
                    onChange={(e) => setGerbongForm({ ...gerbongForm, totalBaris: Number(e.target.value) })}
                    className="flex-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-black text-blue-800">{gerbongForm.totalBaris} Baris</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Sistem otomatis membuat nomor kursi: 1A, 1B (Lorong) 1C, 1D s/d {gerbongForm.totalBaris}D.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddGerbongOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan &amp; Generate Kursi
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}