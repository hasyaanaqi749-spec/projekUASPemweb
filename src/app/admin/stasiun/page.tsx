// src/app/admin/stasiun/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Manajemen Master Data Stasiun (CRUD, Zod Validation, Pagination)
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Train
} from 'lucide-react';

// 1. Skema Validasi Zod untuk Stasiun
const stasiunSchema = z.object({
  kodeStasiun: z
    .string()
    .min(2, { message: 'Kode stasiun minimal 2 karakter.' })
    .max(10, { message: 'Kode stasiun maksimal 10 karakter.' })
    .toUpperCase(),
  namaStasiun: z
    .string()
    .min(3, { message: 'Nama stasiun minimal 3 karakter.' })
    .max(100, { message: 'Nama stasiun maksimal 100 karakter.' }),
  kota: z
    .string()
    .min(3, { message: 'Nama kota minimal 3 karakter.' })
    .max(100, { message: 'Nama kota maksimal 100 karakter.' }),
});

type StasiunFormData = z.infer<typeof stasiunSchema>;

interface StasiunItem {
  id: string;
  kodeStasiun: string;
  namaStasiun: string;
  kota: string;
}

const INITIAL_STATIONS: StasiunItem[] = [
  { id: 'st-01', kodeStasiun: 'GMR', namaStasiun: 'Gambir', kota: 'Jakarta Pusat' },
  { id: 'st-02', kodeStasiun: 'PSE', namaStasiun: 'Pasar Senen', kota: 'Jakarta Pusat' },
  { id: 'st-03', kodeStasiun: 'BD', namaStasiun: 'Bandung', kota: 'Bandung' },
  { id: 'st-04', kodeStasiun: 'CN', namaStasiun: 'Cirebon', kota: 'Cirebon' },
  { id: 'st-05', kodeStasiun: 'SMT', namaStasiun: 'Semarang Tawang', kota: 'Semarang' },
  { id: 'st-06', kodeStasiun: 'YK', namaStasiun: 'Yogyakarta (Tugu)', kota: 'Yogyakarta' },
  { id: 'st-07', kodeStasiun: 'SLO', namaStasiun: 'Solo Balapan', kota: 'Surakarta' },
  { id: 'st-08', kodeStasiun: 'SGU', namaStasiun: 'Surabaya Gubeng', kota: 'Surabaya' },
  { id: 'st-09', kodeStasiun: 'ML', namaStasiun: 'Malang Kotabaru', kota: 'Malang' },
  { id: 'st-10', kodeStasiun: 'BW', namaStasiun: 'Banyuwangi Kota', kota: 'Banyuwangi' },
];

export default function MasterStasiunPage() {
  const [stations, setStations] = useState<StasiunItem[]>(INITIAL_STATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StasiunFormData>({
    kodeStasiun: '',
    namaStasiun: '',
    kota: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete Confirmation Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Fetch data dari API backend Supabase (Fallback ke data lokal)
  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/stasiun');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStations(data);
          }
        }
      } catch (e) {
        console.warn('Menggunakan data stasiun lokal.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ kodeStasiun: '', namaStasiun: '', kota: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: StasiunItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      kodeStasiun: item.kodeStasiun,
      namaStasiun: item.namaStasiun,
      kota: item.kota,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Modal (Tambah / Edit dengan Validasi Zod)
  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = stasiunSchema.safeParse(formData);
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    if (isEditing && currentId) {
      // Update Stasiun
      setStations((prev) =>
        prev.map((s) => (s.id === currentId ? { ...s, ...formData } : s))
      );
      showToast(`Stasiun ${formData.namaStasiun} berhasil diperbarui.`);
    } else {
      // Tambah Stasiun Baru
      const newStation: StasiunItem = {
        id: `st-${Date.now()}`,
        ...formData,
      };
      setStations((prev) => [newStation, ...prev]);
      showToast(`Stasiun ${formData.namaStasiun} berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  // Hapus Stasiun
  const handleConfirmDelete = () => {
    if (deleteId) {
      setStations((prev) => prev.filter((s) => s.id !== deleteId));
      showToast(`Stasiun ${deleteName} berhasil dihapus.`);
      setDeleteId(null);
    }
  };

  // Filter & Pagination Logic
  const filteredStations = stations.filter(
    (s) =>
      s.kodeStasiun.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.namaStasiun.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kota.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage) || 1;
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
              MASTER DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-blue-600" />
            <span>Manajemen Master Stasiun</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola master data stasiun kereta api, kode stasiun resmi, dan lokasi kota di seluruh rute operasional.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer w-fit active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Stasiun Baru</span>
        </button>
      </div>

      {/* SEARCH BAR & DATA TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        
        {/* Toolbar Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan kode, nama stasiun, kota..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page saat mencari
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Total {filteredStations.length} Stasiun Terdaftar
          </span>
        </div>

        {/* TABEL DATA STASIUN */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Kode Stasiun</th>
                <th className="py-3.5 px-4">Nama Stasiun</th>
                <th className="py-3.5 px-4">Kota Lokasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                // SKELETON LOADING ROWS
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-6 bg-slate-200 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedStations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Tidak ada stasiun yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                paginatedStations.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {item.kodeStasiun}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {item.namaStasiun}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.kota}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Stasiun"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteName(item.namaStasiun);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Stasiun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Menampilkan Halaman <strong className="font-bold text-slate-900">{currentPage}</strong> dari <strong className="font-bold text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-3 py-1 font-bold text-blue-600 bg-blue-50 rounded-xl">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* MODAL FORM TAMBAH & EDIT (ZOD VALIDATED)                            */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {isEditing ? 'Edit Data Stasiun' : 'Tambah Stasiun Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              {/* Input Kode Stasiun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kode Stasiun (2–10 Huruf) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Contoh: GMR, YK, SGU"
                  value={formData.kodeStasiun}
                  onChange={(e) =>
                    setFormData({ ...formData, kodeStasiun: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                {formErrors.kodeStasiun && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {formErrors.kodeStasiun}
                  </p>
                )}
              </div>

              {/* Input Nama Stasiun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nama Stasiun Kereta Api *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Yogyakarta (Tugu)"
                  value={formData.namaStasiun}
                  onChange={(e) =>
                    setFormData({ ...formData, namaStasiun: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                {formErrors.namaStasiun && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {formErrors.namaStasiun}
                  </p>
                )}
              </div>

              {/* Input Kota */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kota Lokasi *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Yogyakarta"
                  value={formData.kota}
                  onChange={(e) =>
                    setFormData({ ...formData, kota: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                {formErrors.kota && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">
                    {formErrors.kota}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambahkan Stasiun'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL KONFIRMASI HAPUS                                              */}
      {/* =================================================================== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Hapus Stasiun?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data stasiun <strong>{deleteName}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}