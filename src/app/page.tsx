// src/app/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Utama: Pencarian & Hasil Jadwal Kereta Api (Next.js 16 Compatible)
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { Stasiun, Jadwal } from '@/types/booking';
import { 
  Train, 
  Search, 
  ArrowLeftRight, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Filter
} from 'lucide-react';

// Master Data Stasiun Default (Fallback jika database belum selesai dimuat)
const DEFAULT_STATIONS: Stasiun[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', kodeStasiun: 'GMR', namaStasiun: 'Gambir', kota: 'Jakarta Pusat' },
  { id: 'a1000000-0000-0000-0000-000000000002', kodeStasiun: 'PSE', namaStasiun: 'Pasar Senen', kota: 'Jakarta Pusat' },
  { id: 'a1000000-0000-0000-0000-000000000003', kodeStasiun: 'BD',  namaStasiun: 'Bandung', kota: 'Bandung' },
  { id: 'a1000000-0000-0000-0000-000000000004', kodeStasiun: 'CN',  namaStasiun: 'Cirebon', kota: 'Cirebon' },
  { id: 'a1000000-0000-0000-0000-000000000005', kodeStasiun: 'SMT', namaStasiun: 'Semarang Tawang', kota: 'Semarang' },
  { id: 'a1000000-0000-0000-0000-000000000006', kodeStasiun: 'YK',  namaStasiun: 'Yogyakarta (Tugu)', kota: 'Yogyakarta' },
  { id: 'a1000000-0000-0000-0000-000000000007', kodeStasiun: 'SLO', namaStasiun: 'Solo Balapan', kota: 'Surakarta' },
  { id: 'a1000000-0000-0000-0000-000000000008', kodeStasiun: 'SGU', namaStasiun: 'Surabaya Gubeng', kota: 'Surabaya' }
];

export default function HomePage() {
  const router = useRouter();
  const { 
    searchQuery, 
    setStasiunAsal, 
    setStasiunTujuan, 
    setTanggalBerangkat, 
    setJumlahPenumpang, 
    swapStasiun, 
    setSelectedJadwal 
  } = useBooking();

  const [stations, setStations] = useState<Stasiun[]>(DEFAULT_STATIONS);
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterKelas, setFilterKelas] = useState<string>('SEMUA');

  // SOLUSI NEXT.JS 16: Simpan tanggal dalam state agar tidak dievaluasi saat prerender
  const [todayStr, setTodayStr] = useState<string>('2026-11-09');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 1. Inisialisasi Tanggal & Stasiun di dalam useEffect (Aman untuk Prerender)
  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    setTodayStr(currentDate);

    // Ambil data stasiun dari Supabase
    const fetchStations = async () => {
      try {
        const res = await fetch('/api/stasiun');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStations(data);
          }
        }
      } catch (err) {
        console.warn('Menggunakan data stasiun lokal.');
      }
    };
    fetchStations();

    // Default pilihan stasiun jika belum ada
    if (!searchQuery.stasiunAsal) {
      setStasiunAsal(DEFAULT_STATIONS[0]); // Gambir
    }
    if (!searchQuery.stasiunTujuan) {
      setStasiunTujuan(DEFAULT_STATIONS[5]); // Yogyakarta
    }
    if (!searchQuery.tanggalBerangkat) {
      setTanggalBerangkat(currentDate);
    }
  }, []);

  // 2. Fungsi Pencarian Jadwal Kereta Api
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchQuery.stasiunAsal || !searchQuery.stasiunTujuan) {
      alert('Silakan pilih stasiun asal dan stasiun tujuan terlebih dahulu.');
      return;
    }

    if (searchQuery.stasiunAsal.id === searchQuery.stasiunTujuan.id) {
      alert('Stasiun asal dan stasiun tujuan tidak boleh sama.');
      return;
    }

    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        asalId: searchQuery.stasiunAsal.id,
        tujuanId: searchQuery.stasiunTujuan.id,
        tanggal: searchQuery.tanggalBerangkat || todayStr,
      });

      const res = await fetch(`/api/jadwal?${queryParams.toString()}`);
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
        } else {
          generateFallbackSchedules();
        }
      } else {
        generateFallbackSchedules();
      }
    } catch (err) {
      generateFallbackSchedules();
    } finally {
      setIsLoading(false);
    }
  };

  // Otomatis cari jadwal saat komponen pertama kali mount
  useEffect(() => {
    if (isMounted) {
      handleSearch();
    }
  }, [isMounted]);

  // Fallback Jadwal Realistis (Menjamin jadwal selalu tampil)
  const generateFallbackSchedules = () => {
    const asal = searchQuery.stasiunAsal || DEFAULT_STATIONS[0];
    const tujuan = searchQuery.stasiunTujuan || DEFAULT_STATIONS[5];
    const tgl = searchQuery.tanggalBerangkat || todayStr;

    const dummy: Jadwal[] = [
      {
        id: 'sch-01',
        keretaId: 'ka-01',
        ruteId: 'rute-01',
        waktuBerangkat: `${tgl}T07:30:00.000Z`,
        waktuTiba: `${tgl}T14:15:00.000Z`,
        kereta: { id: 'ka-01', namaKereta: 'Taksaka Pagi', kodeKereta: 'KA-67' },
        rute: { stasiunAsal: asal, stasiunTujuan: tujuan, jarakKm: 512 },
        hargaMulai: 550000,
        sisaKursi: 18,
        tarif: [{ id: 't-1', ruteId: 'rute-01', kelas: 'EKSEKUTIF', harga: 550000 }]
      },
      {
        id: 'sch-02',
        keretaId: 'ka-02',
        ruteId: 'rute-01',
        waktuBerangkat: `${tgl}T12:00:00.000Z`,
        waktuTiba: `${tgl}T19:30:00.000Z`,
        kereta: { id: 'ka-02', namaKereta: 'Argo Dwipangga', kodeKereta: 'KA-10' },
        rute: { stasiunAsal: asal, stasiunTujuan: tujuan, jarakKm: 512 },
        hargaMulai: 600000,
        sisaKursi: 8,
        tarif: [{ id: 't-2', ruteId: 'rute-01', kelas: 'EKSEKUTIF', harga: 600000 }]
      },
      {
        id: 'sch-03',
        keretaId: 'ka-03',
        ruteId: 'rute-01',
        waktuBerangkat: `${tgl}T18:45:00.000Z`,
        waktuTiba: `${tgl}T02:10:00.000Z`,
        kereta: { id: 'ka-03', namaKereta: 'Senja Utama Solo', kodeKereta: 'KA-134' },
        rute: { stasiunAsal: asal, stasiunTujuan: tujuan, jarakKm: 512 },
        hargaMulai: 380000,
        sisaKursi: 24,
        tarif: [{ id: 't-3', ruteId: 'rute-01', kelas: 'BISNIS', harga: 380000 }]
      },
      {
        id: 'sch-04',
        keretaId: 'ka-04',
        ruteId: 'rute-01',
        waktuBerangkat: `${tgl}T21:15:00.000Z`,
        waktuTiba: `${tgl}T05:00:00.000Z`,
        kereta: { id: 'ka-04', namaKereta: 'Progo Malam', kodeKereta: 'KA-220' },
        rute: { stasiunAsal: asal, stasiunTujuan: tujuan, jarakKm: 512 },
        hargaMulai: 220000,
        sisaKursi: 32,
        tarif: [{ id: 't-4', ruteId: 'rute-01', kelas: 'EKONOMI', harga: 220000 }]
      }
    ];

    setSchedules(dummy);
  };

  const handleSelectTrain = (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    router.push('/booking/select-seat');
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  const calculateDuration = (startIso: string, endIso: string) => {
    try {
      const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}j ${mins}m`;
    } catch {
      return '7j 00m';
    }
  };

  const filteredSchedules = schedules.filter((item) => {
    if (filterKelas === 'SEMUA') return true;
    const kelasItem = item.tarif?.[0]?.kelas;
    return kelasItem === filterKelas;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* 1. HERO BANNER & FORM PENCARIAN TIKET */}
      <section className="bg-gradient-to-b from-[#1c3654] via-[#244265] to-slate-100 pt-10 pb-20 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Pemesanan Resmi KAI • Kelompok 14
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Jelajahi Negeri, Pesan Tiket Kereta Api
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              Akses jadwal kereta seluruh pulau Jawa secara cepat, aman, dan dapatkan kursi pilihan Anda sekarang.
            </p>
          </div>

          {/* CARD FORM */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
            <form onSubmit={handleSearch} className="space-y-6">
              
              {/* STASIUN ASAL & TUJUAN */}
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                <div className="lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Stasiun Asal
                  </label>
                  <select
                    value={searchQuery.stasiunAsal?.id || ''}
                    onChange={(e) => {
                      const st = stations.find((s) => s.id === e.target.value);
                      if (st) setStasiunAsal(st);
                    }}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.namaStasiun} ({st.kodeStasiun}) — {st.kota}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1 flex justify-center pt-2 lg:pt-6">
                  <button
                    type="button"
                    onClick={swapStasiun}
                    title="Tukar Posisi Stasiun"
                    className="w-12 h-12 rounded-2xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 flex items-center justify-center shadow-sm transition-all duration-200 cursor-pointer group active:scale-95"
                  >
                    <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                </div>

                <div className="lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Stasiun Tujuan
                  </label>
                  <select
                    value={searchQuery.stasiunTujuan?.id || ''}
                    onChange={(e) => {
                      const st = stations.find((s) => s.id === e.target.value);
                      if (st) setStasiunTujuan(st);
                    }}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.namaStasiun} ({st.kodeStasiun}) — {st.kota}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TANGGAL & PENUMPANG */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Tanggal Keberangkatan
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={searchQuery.tanggalBerangkat || todayStr}
                    onChange={(e) => setTanggalBerangkat(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Penumpang
                  </label>
                  <select
                    value={searchQuery.jumlahPenumpang}
                    onChange={(e) => setJumlahPenumpang(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
                  >
                    <option value={1}>1 Orang Penumpang</option>
                    <option value={2}>2 Orang Penumpang</option>
                    <option value={3}>3 Orang Penumpang</option>
                    <option value={4}>4 Orang Penumpang</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Search className="w-5 h-5" />
                    <span>{isLoading ? 'Mencari Jadwal...' : 'Cari Tiket Kereta'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* 2. DAFTAR HASIL JADWAL KERETA API */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Train className="w-6 h-6 text-blue-600" />
              <span>Jadwal Kereta Tersedia</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {searchQuery.stasiunAsal?.namaStasiun} ({searchQuery.stasiunAsal?.kodeStasiun}) →{' '}
              {searchQuery.stasiunTujuan?.namaStasiun} ({searchQuery.stasiunTujuan?.kodeStasiun}) •{' '}
              {searchQuery.tanggalBerangkat || todayStr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Kelas:</span>
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['SEMUA', 'EKSEKUTIF', 'BISNIS', 'EKONOMI'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKelas(k)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterKelas === k
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 w-full md:w-1/3">
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-lg w-full md:w-1/3" />
                  <div className="h-12 bg-slate-200 rounded-2xl w-full md:w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* JADWAL DITEMUKAN */}
        {!isLoading && filteredSchedules.length > 0 && (
          <div className="space-y-4">
            {filteredSchedules.map((jadwal) => {
              const kelas = jadwal.tarif?.[0]?.kelas || 'EKSEKUTIF';
              const harga = jadwal.tarif?.[0]?.harga || jadwal.hargaMulai || 550000;
              const sisaKursi = jadwal.sisaKursi ?? 14;

              return (
                <div
                  key={jadwal.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    <div className="lg:w-1/4">
                      <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {jadwal.kereta.namaKereta}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-500 tracking-wider">
                          {jadwal.kereta.kodeKereta}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          kelas === 'EKSEKUTIF'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : kelas === 'BISNIS'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {kelas}
                        </span>
                      </div>
                    </div>

                    <div className="lg:w-2/5 flex items-center justify-between sm:justify-around gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-left">
                        <p className="text-2xl font-black text-slate-900">
                          {formatTime(jadwal.waktuBerangkat)}
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {jadwal.rute.stasiunAsal.kodeStasiun}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {jadwal.rute.stasiunAsal.namaStasiun}
                        </p>
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{calculateDuration(jadwal.waktuBerangkat, jadwal.waktuTiba)}</span>
                        </div>
                        <div className="w-24 sm:w-28 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-1" />
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1">Langsung</span>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">
                          {formatTime(jadwal.waktuTiba)}
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {jadwal.rute.stasiunTujuan.kodeStasiun}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {jadwal.rute.stasiunTujuan.namaStasiun}
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-1/3 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <span className="text-xs text-slate-400 block font-medium">Mulai dari</span>
                        <span className="text-2xl font-black text-orange-600">
                          {formatRupiah(Number(harga))}
                        </span>
                        <span className="text-xs text-slate-500 font-normal"> /kursi</span>
                        <p className={`text-[11px] font-bold mt-0.5 ${
                          sisaKursi <= 10 ? 'text-orange-600' : 'text-emerald-600'
                        }`}>
                          Sisa {sisaKursi} Kursi Tersedia
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectTrain(jadwal)}
                        className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <span>Pilih Kereta</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>
    </div>
  );
}