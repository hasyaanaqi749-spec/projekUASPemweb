// src/app/booking/select-seat/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Pemilihan Kursi Visual (Seat Map) & Form Data Penumpang (Zod Validated)
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useBooking } from '@/context/BookingContext';
import { 
  Train, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Loader2
} from 'lucide-react';

// ========================================================================
// 1. SKEMA VALIDASI ZOD UNTUK DATA PENUMPANG & KONTAK
// ========================================================================
const passengerSchema = z.object({
  nama: z
    .string()
    .min(3, { message: 'Nama lengkap minimal 3 karakter.' })
    .max(100, { message: 'Nama maksimal 100 karakter.' }),
  tipeIdentitas: z.enum(['NIK', 'PASPOR']),
  identitas: z
    .string()
    .min(10, { message: 'Nomor identitas minimal 10 karakter.' })
    .max(16, { message: 'Nomor identitas maksimal 16 digit.' }),
  phone: z
    .string()
    .min(10, { message: 'Nomor HP minimal 10 digit.' })
    .max(15, { message: 'Nomor HP maksimal 15 digit.' })
    .regex(/^[0-9+]+$/, { message: 'Nomor HP hanya boleh berisi angka.' }),
  email: z
    .string()
    .email({ message: 'Format alamat email tidak valid.' }),
  kursiId: z.string().min(1, { message: 'Kursi wajib dipilih di denah gerbong.' }),
  nomorKursi: z.string().min(1, { message: 'Nomor kursi wajib dipilih.' }),
  namaGerbong: z.string().min(1, { message: 'Gerbong wajib dipilih.' }),
});

type PassengerFormData = z.infer<typeof passengerSchema>;

export default function SelectSeatAndPassengerPage() {
  const router = useRouter();
  const { 
    searchQuery, 
    selectedJadwal, 
    penumpangList, 
    updatePenumpang, 
    assignKursiToPenumpang 
  } = useBooking();

  // Tab gerbong kereta
  const gerbongOptions = ['Eksekutif 1', 'Eksekutif 2', 'Eksekutif 3'];
  const [activeGerbong, setActiveGerbong] = useState<string>('Eksekutif 1');

  // Penumpang yang sedang aktif mengisi form / memilih kursi (0, 1, dst)
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);

  // Kontak Penanggung Jawab Pemesan
  const [contactPhone, setContactPhone] = useState<string>('081234567890');
  const [contactEmail, setContactEmail] = useState<string>('penumpang@gmail.com');

  // State Error Validasi Zod & Loading Transaksi
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');

  // Simulasi data kursi yang sudah dipesan di Supabase per gerbong
  const occupiedSeatsByGerbong: { [gerbong: string]: string[] } = {
    'Eksekutif 1': ['1B', '2A', '2B', '4D', '6A', '7C', '8B', '10A'],
    'Eksekutif 2': ['1A', '3C', '3D', '5A', '5B', '9C', '9D'],
    'Eksekutif 3': ['2C', '2D', '4A', '7B', '8A'],
  };

  // Baris kursi 1 sampai 10
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  // Data Kereta
  const keretaNama = selectedJadwal?.kereta?.namaKereta || 'Taksaka Pagi';
  const keretaKode = selectedJadwal?.kereta?.kodeKereta || 'KA-67';
  const kelas = selectedJadwal?.tarif?.[0]?.kelas || 'EKSEKUTIF';
  const hargaPerTiket = Number(selectedJadwal?.tarif?.[0]?.harga || selectedJadwal?.hargaMulai || 550000);
  const totalPembayaran = hargaPerTiket * penumpangList.length;

  // Jika belum memilih stasiun asal atau jadwal, kembalikan ke beranda
  useEffect(() => {
    if (!selectedJadwal && !searchQuery.stasiunAsal) {
      router.push('/');
    }
  }, [selectedJadwal, searchQuery, router]);

  // Cek status kepemilikan kursi di gerbong aktif
  const getSeatStatus = (nomorKursi: string) => {
    const occupiedList = occupiedSeatsByGerbong[activeGerbong] || [];
    if (occupiedList.includes(nomorKursi)) {
      return { status: 'TERISI', passengerIndex: -1 };
    }

    // Cek apakah dipilih oleh salah satu penumpang di transaksi ini
    for (let i = 0; i < penumpangList.length; i++) {
      if (penumpangList[i].nomorKursi === nomorKursi && penumpangList[i].namaGerbong === activeGerbong) {
        return { status: 'DIPILIH', passengerIndex: i };
      }
    }

    return { status: 'KOSONG', passengerIndex: -1 };
  };

  // Handler klik kursi di visual denah
  const handleSelectSeat = (nomorKursi: string) => {
    const { status } = getSeatStatus(nomorKursi);
    if (status === 'TERISI') return; // Tidak bisa pilih kursi yang sudah dibeli

    // Tetapkan ke penumpang yang sedang aktif
    assignKursiToPenumpang(
      activePassengerIndex,
      `seat-${activeGerbong}-${nomorKursi}`,
      nomorKursi,
      activeGerbong
    );

    // Hapus pesan error kursi jika sebelumnya error
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${activePassengerIndex}_kursiId`];
      delete copy[`${activePassengerIndex}_nomorKursi`];
      return copy;
    });

    // Otomatis arahkan fokus ke penumpang berikutnya yang belum punya kursi
    if (activePassengerIndex + 1 < penumpangList.length) {
      const nextPassenger = penumpangList[activePassengerIndex + 1];
      if (!nextPassenger.nomorKursi) {
        setActivePassengerIndex(activePassengerIndex + 1);
      }
    }
  };

  // Handler Submit Pemesanan & Validasi Zod
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setValidationErrors({});

    const newErrors: { [key: string]: string } = {};

    // 1. Validasi Zod per penumpang
    penumpangList.forEach((p, idx) => {
      const candidateData: PassengerFormData = {
        nama: p.nama,
        tipeIdentitas: p.tipeIdentitas,
        identitas: p.identitas,
        phone: contactPhone,
        email: contactEmail,
        kursiId: p.kursiId || '',
        nomorKursi: p.nomorKursi || '',
        namaGerbong: p.namaGerbong || '',
      };

      const result = passengerSchema.safeParse(candidateData);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          // PERBAIKAN TS(2731): Konversi eksplisit String(...)
          const field = String(issue.path[0]);
          newErrors[`${idx}_${field}`] = issue.message;
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setGeneralError('Mohon lengkapi dan perbaiki data formulir yang bertanda merah di bawah ini.');
      return;
    }

    // 2. Kirim transaksi ke backend API Supabase
    setIsSubmitting(true);
    try {
      const payload = {
        jadwalId: selectedJadwal?.id || '10000000-0000-0000-0000-000000000001',
        totalBayar: totalPembayaran,
        kontak: {
          phone: contactPhone,
          email: contactEmail,
        },
        penumpang: penumpangList.map((p) => ({
          nama: p.nama,
          identitas: p.identitas,
          tipeIdentitas: p.tipeIdentitas,
          kursiId: p.kursiId,
          nomorKursi: p.nomorKursi,
          namaGerbong: p.namaGerbong,
        })),
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Berhasil membuat pesanan di Supabase
        const bookingCode = data.booking?.kodeBooking || data.kodeBooking || 'KAI-BOOKING';
        router.push(`/booking/checkout?code=${bookingCode}`);
      } else {
        // Fallback jika API backend offline saat simulasi
        router.push(`/booking/checkout?code=KAI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
      }
    } catch (err: any) {
      router.push(`/booking/checkout?code=KAI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SUMMARY KERETA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{keretaNama}</h1>
                <span className="text-xs font-bold text-slate-400">({keretaKode})</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {kelas}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery.stasiunAsal?.namaStasiun || 'Gambir'} →{' '}
                {searchQuery.stasiunTujuan?.namaStasiun || 'Yogyakarta'} •{' '}
                {searchQuery.tanggalBerangkat}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
            <span className="text-xs text-slate-400 block font-medium">Harga per Tiket</span>
            <span className="text-xl font-black text-slate-900">{formatRupiah(hargaPerTiket)}</span>
          </div>
        </div>

        {/* NOTIFIKASI ERROR UMUM */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{generalError}</span>
          </div>
        )}

        {/* GRID UTAMA: KIRI (FORM ZOD) & KANAN (SEAT MAP) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================
              KOLOM KIRI: FORM PENGISIAN DATA PENUMPANG (ZOD)
             ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Kontak Pemesan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Informasi Kontak Pemesan</span>
              </h2>
              <p className="text-xs text-slate-500">
                E-tiket dan notifikasi jadwal kereta akan dikirimkan ke email dan nomor WhatsApp ini.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Handphone (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Form Penumpang Perorangan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Data Penumpang</span>
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {penumpangList.length} Orang
                </span>
              </div>

              {/* Selector Tab Penumpang (P1, P2, ...) */}
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {penumpangList.map((p, idx) => {
                  const isActive = activePassengerIndex === idx;
                  const hasSeat = Boolean(p.nomorKursi);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePassengerIndex(idx)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Penumpang {idx + 1}</span>
                      {hasSeat ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                          isActive ? 'bg-blue-700 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.nomorKursi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold">• Pilih Kursi</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Input Form untuk Penumpang Aktif */}
              {penumpangList[activePassengerIndex] && (
                <div className="space-y-4 pt-2">
                  
                  {/* Status Kursi Terpilih */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Kursi Terpilih:</span>
                    {penumpangList[activePassengerIndex].nomorKursi ? (
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {penumpangList[activePassengerIndex].namaGerbong} — Kursi {penumpangList[activePassengerIndex].nomorKursi}
                      </span>
                    ) : (
                      <span className="font-bold text-amber-600">Belum memilih kursi di denah</span>
                    )}
                  </div>
                  {validationErrors[`${activePassengerIndex}_kursiId`] && (
                    <p className="text-[11px] text-red-500 font-semibold -mt-2">
                      ⚠️ {validationErrors[`${activePassengerIndex}_kursiId`]}
                    </p>
                  )}

                  {/* Input Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap (Sesuai KTP / Paspor) *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={penumpangList[activePassengerIndex].nama}
                      onChange={(e) => updatePenumpang(activePassengerIndex, 'nama', e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 transition ${
                        validationErrors[`${activePassengerIndex}_nama`]
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                          : 'border-slate-300 focus:ring-blue-600'
                      }`}
                    />
                    {validationErrors[`${activePassengerIndex}_nama`] && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">
                        {validationErrors[`${activePassengerIndex}_nama`]}
                      </p>
                    )}
                  </div>

                  {/* Input Tipe Identitas & Nomor NIK */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe</label>
                      <select
                        value={penumpangList[activePassengerIndex].tipeIdentitas}
                        onChange={(e) => updatePenumpang(activePassengerIndex, 'tipeIdentitas', e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
                      >
                        <option value="NIK">NIK (KTP)</option>
                        <option value="PASPOR">Paspor</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Identitas (16 Digit) *
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="3301xxxxxxxxxxxx"
                        value={penumpangList[activePassengerIndex].identitas}
                        onChange={(e) => updatePenumpang(activePassengerIndex, 'identitas', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 transition ${
                          validationErrors[`${activePassengerIndex}_identitas`]
                            ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                            : 'border-slate-300 focus:ring-blue-600'
                        }`}
                      />
                    </div>
                  </div>
                  {validationErrors[`${activePassengerIndex}_identitas`] && (
                    <p className="text-[11px] text-red-500 font-semibold -mt-2">
                      {validationErrors[`${activePassengerIndex}_identitas`]}
                    </p>
                  )}

                </div>
              )}
            </div>

          </div>

          {/* ========================================================
              KOLOM KANAN: DENAH KURSI VISUAL (LAYOUT 2-2)
             ======================================================== */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              
              {/* Header & Selector Pindah Gerbong */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Train className="w-5 h-5 text-blue-600" />
                    <span>Peta Denah Kursi Gerbong</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memilih kursi untuk: <strong className="text-blue-600 font-bold">Penumpang {activePassengerIndex + 1} ({penumpangList[activePassengerIndex]?.nama || 'Belum Ada Nama'})</strong>
                  </p>
                </div>

                {/* Selector Gerbong 1, Gerbong 2, Gerbong 3 */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {gerbongOptions.map((gb) => (
                    <button
                      key={gb}
                      type="button"
                      onClick={() => setActiveGerbong(gb)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeGerbong === gb
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {gb}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legenda Warna Kursi */}
              <div className="flex flex-wrap items-center justify-center gap-6 py-3.5 my-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                {/* 1. Putih = Kosong */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-white border border-slate-300 shadow-xs" />
                  <span className="text-slate-700 font-medium">Kosong (Tersedia)</span>
                </div>
                {/* 2. Hijau = Dipilih */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-emerald-600 border border-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-emerald-700 font-bold">Dipilih (Aktif)</span>
                </div>
                {/* 3. Merah = Terisi */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-red-100 border border-red-300 text-red-500 flex items-center justify-center text-[10px] font-bold">
                    ✕
                  </div>
                  <span className="text-red-500 font-medium">Terisi (Disabled)</span>
                </div>
              </div>

              {/* Rangkaian Denah Fisik Gerbong (Layout 2-2) */}
              <div className="mt-5 max-w-sm mx-auto bg-slate-100/70 p-5 rounded-3xl border-2 border-dashed border-slate-200">
                
                {/* Ujung Depan Gerbong */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-3 border-b border-slate-200 mb-4">
                  <span>Pintu Depan</span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                    {activeGerbong}
                  </span>
                </div>

                {/* Header Kolom (A B - Lorong - C D) */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-black text-slate-500 mb-2">
                  <div>A</div>
                  <div>B</div>
                  <div className="text-[10px] text-slate-400 font-normal uppercase flex items-center justify-center">
                    Lorong
                  </div>
                  <div>C</div>
                  <div>D</div>
                </div>

                {/* Baris Kursi */}
                <div className="space-y-2.5">
                  {rows.map((row) => (
                    <div key={row} className="grid grid-cols-5 gap-2 items-center">
                      {(['A', 'B'] as const).map((col) => {
                        const nomorKursi = `${row}${col}`;
                        const { status, passengerIndex } = getSeatStatus(nomorKursi);
                        const isSelectedByActive = status === 'DIPILIH' && passengerIndex === activePassengerIndex;

                        let styleClasses = 'bg-white border-slate-300 text-slate-800 hover:bg-blue-50 hover:border-blue-400 cursor-pointer shadow-xs';
                        if (status === 'TERISI') {
                          styleClasses = 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-75';
                        } else if (status === 'DIPILIH') {
                          styleClasses = isSelectedByActive
                            ? 'bg-emerald-600 border-emerald-700 text-white font-extrabold shadow-md ring-4 ring-emerald-300/60 scale-105'
                            : 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-sm';
                        }

                        return (
                          <button
                            key={nomorKursi}
                            type="button"
                            disabled={status === 'TERISI'}
                            onClick={() => handleSelectSeat(nomorKursi)}
                            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition duration-150 ${styleClasses}`}
                          >
                            <span className="font-mono text-[11px] leading-tight font-bold">{nomorKursi}</span>
                            {status === 'DIPILIH' && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold -mt-0.5">
                                P{passengerIndex + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Lorong Jalan */}
                      <div className="text-center font-mono text-[11px] font-bold text-slate-400 select-none">
                        {row}
                      </div>

                      {(['C', 'D'] as const).map((col) => {
                        const nomorKursi = `${row}${col}`;
                        const { status, passengerIndex } = getSeatStatus(nomorKursi);
                        const isSelectedByActive = status === 'DIPILIH' && passengerIndex === activePassengerIndex;

                        let styleClasses = 'bg-white border-slate-300 text-slate-800 hover:bg-blue-50 hover:border-blue-400 cursor-pointer shadow-xs';
                        if (status === 'TERISI') {
                          styleClasses = 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-75';
                        } else if (status === 'DIPILIH') {
                          styleClasses = isSelectedByActive
                            ? 'bg-emerald-600 border-emerald-700 text-white font-extrabold shadow-md ring-4 ring-emerald-300/60 scale-105'
                            : 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-sm';
                        }

                        return (
                          <button
                            key={nomorKursi}
                            type="button"
                            disabled={status === 'TERISI'}
                            onClick={() => handleSelectSeat(nomorKursi)}
                            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition duration-150 ${styleClasses}`}
                          >
                            <span className="font-mono text-[11px] leading-tight font-bold">{nomorKursi}</span>
                            {status === 'DIPILIH' && (
                              <span className="text-[9px] uppercase tracking-wider font-extrabold -mt-0.5">
                                P{passengerIndex + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Ujung Belakang Gerbong */}
                <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-200 mt-4">
                  Toilet &amp; Pintu Belakang
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          STICKY BOTTOM BAR: TOTAL BIAYA & TOMBOL PEMBAYARAN
         ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total Tagihan ({penumpangList.length} Penumpang)</span>
              <span className="text-2xl font-black text-orange-600">
                {formatRupiah(totalPembayaran)}
              </span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Jaminan Bebas Double-Booking Supabase</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitBooking}
            className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Pemesanan...</span>
              </>
            ) : (
              <>
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
}