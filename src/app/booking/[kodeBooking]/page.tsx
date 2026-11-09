// src/app/booking/[kodeBooking]/page.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Halaman Detail E-Tiket Resmi, Boarding Pass & Ringkasan Transaksi
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Train, 
  Printer, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  ShieldCheck, 
  QrCode,
  CreditCard,
  Building2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

interface PassengerTicket {
  id: string;
  nama: string;
  identitas: string;
  nomorKursi: string;
  namaGerbong: string;
  statusTiket: 'BOOKED' | 'BOARDED';
}

interface BookingDetail {
  kodeBooking: string;
  statusPembayaran: 'PENDING' | 'PAID' | 'CANCELLED';
  totalBayar: number;
  waktuPesan: string;
  expiredAt: string;
  kereta: {
    nama: string;
    kode: string;
    kelas: string;
  };
  rute: {
    stasiunAsal: string;
    kodeAsal: string;
    kotaAsal: string;
    stasiunTujuan: string;
    kodeTujuan: string;
    kotaTujuan: string;
    waktuBerangkat: string;
    waktuTiba: string;
    durasi: string;
  };
  penumpang: PassengerTicket[];
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kodeBooking = String(params?.kodeBooking || 'KAI-7A89X').toUpperCase();

  const [hasCopiedVA, setHasCopiedVA] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BRI'>('BCA');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Data Simulasi Detail Pemesanan (Sinkron dengan skema Supabase)
  const [bookingData, setBookingData] = useState<BookingDetail>({
    kodeBooking: kodeBooking,
    statusPembayaran: 'PAID', // 'PENDING' | 'PAID' | 'CANCELLED'
    totalBayar: 550000,
    waktuPesan: '2026-11-09T08:30:00.000Z',
    expiredAt: '2026-11-09T10:30:00.000Z',
    kereta: {
      nama: 'Taksaka Malam',
      kode: 'KA-67',
      kelas: 'EKSEKUTIF',
    },
    rute: {
      stasiunAsal: 'Gambir',
      kodeAsal: 'GMR',
      kotaAsal: 'Jakarta Pusat',
      stasiunTujuan: 'Yogyakarta',
      kodeTujuan: 'YK',
      kotaTujuan: 'Yogyakarta',
      waktuBerangkat: '20:45 WIB',
      waktuTiba: '03:30 WIB',
      durasi: '6j 45m',
    },
    penumpang: [
      {
        id: 'tkt-01',
        nama: 'Budi Santoso',
        identitas: '3301234567890001',
        nomorKursi: '5A',
        namaGerbong: 'Eksekutif 1',
        statusTiket: 'BOOKED',
      },
    ],
  });

  // Ambil data real-time dari backend API jika tersedia
  useEffect(() => {
    const fetchBookingFromApi = async () => {
      try {
        const res = await fetch(`/api/bookings/${kodeBooking}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.kodeBooking) {
            setBookingData(data);
          }
        }
      } catch (err) {
        console.log('Menggunakan data rendering e-tiket lokal.');
      }
    };
    fetchBookingFromApi();
  }, [kodeBooking]);

  const handleCopyVa = (vaNumber: string) => {
    navigator.clipboard.writeText(vaNumber);
    setHasCopiedVA(true);
    setTimeout(() => setHasCopiedVA(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingData.kodeBooking);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  // Simulasi Bayar Instan (Mengubah status dari PENDING ke PAID)
  const handleSimulatePayment = async () => {
    setIsProcessingPayment(true);
    try {
      await fetch(`/api/bookings/${bookingData.kodeBooking}/pay`, { method: 'POST' });
    } catch (e) {
      // Abaikan jika endpoint belum ada
    }
    setTimeout(() => {
      setBookingData((prev) => ({ ...prev, statusPembayaran: 'PAID' }));
      setIsProcessingPayment(false);
    }, 1000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Nomor Virtual Account Bank
  const vaNumbers = {
    BCA: '88014-9920192841',
    MANDIRI: '89022-7718290123',
    BRI: '12033-6628192019',
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      
      {/* 1. TOP ACTION BAR (DISEMBUNYIKAN SAAT PRINT) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintTicket}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak E-Tiket / PDF</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* 2. BANNER STATUS PEMBAYARAN PENDING (JIKA BELUM LUNAS) */}
        {bookingData.statusPembayaran === 'PENDING' && (
          <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-xl print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider bg-white/20 w-fit px-3 py-1 rounded-full mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Menunggu Pembayaran</span>
                </div>
                <h2 className="text-2xl font-black">Selesaikan Pembayaran Tiket Anda</h2>
                <p className="text-xs text-amber-100 mt-1">
                  Batas waktu pembayaran sebelum dibatalkan otomatis oleh sistem worker.
                </p>
              </div>

              <div className="text-right flex flex-col items-start md:items-end">
                <span className="text-xs text-amber-100 block">Total Tagihan:</span>
                <span className="text-3xl font-black">{formatRupiah(bookingData.totalBayar)}</span>
              </div>
            </div>

            {/* Kotak Virtual Account */}
            <div className="mt-6 bg-white text-slate-800 p-5 rounded-2xl shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex gap-2">
                  {(['BCA', 'MANDIRI', 'BRI'] as const).map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedBank === bank
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Virtual Account {bank}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessingPayment}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isProcessingPayment ? 'Memverifikasi...' : 'Simulasi Bayar Lunas'}</span>
                </button>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Nomor Virtual Account ({selectedBank}):</span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 tracking-wider">
                    {vaNumbers[selectedBank]}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyVa(vaNumbers[selectedBank])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-200 transition cursor-pointer"
                >
                  {hasCopiedVA ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedVA ? 'Tersalin!' : 'Salin Nomor VA'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. TAMPILAN RESMI BOARDING PASS E-TIKET KAI */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none">
          
          {/* HEADER BOARDING PASS */}
          <div className="bg-[#1c3654] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Train className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight">
                  Rail<span className="text-orange-500">ink</span>.
                </span>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                  Boarding Pass Resmi Kereta Api Indonesia
                </p>
              </div>
            </div>

            {/* BADGE STATUS */}
            <div className="flex items-center gap-3">
              {bookingData.statusPembayaran === 'PAID' ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Lunas (Siap Boarding)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Pending Pembayaran</span>
                </div>
              )}
            </div>
          </div>

          {/* DETAIL PERJALANAN (RUTE, JAM, DURASI) */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* STASIUN ASAL */}
              <div className="md:w-1/3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keberangkatan</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{bookingData.rute.kodeAsal}</p>
                <p className="text-sm font-bold text-slate-800">{bookingData.rute.stasiunAsal}</p>
                <p className="text-xs text-slate-400">{bookingData.rute.kotaAsal}</p>
                <p className="text-sm font-black text-blue-600 mt-2">{bookingData.rute.waktuBerangkat}</p>
              </div>

              {/* DURASI & PANAH JALUR */}
              <div className="md:w-1/3 flex flex-col items-center justify-center text-center px-4">
                <span className="text-xs font-bold text-slate-500 mb-1">{bookingData.rute.durasi}</span>
                <div className="w-full flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
                  <Train className="w-5 h-5 text-blue-600 mx-1" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mt-1">
                  {bookingData.kereta.nama} ({bookingData.kereta.kode})
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold mt-0.5">
                  Kelas {bookingData.kereta.kelas}
                </span>
              </div>

              {/* STASIUN TUJUAN */}
              <div className="md:w-1/3 text-left md:text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tujuan Akhir</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{bookingData.rute.kodeTujuan}</p>
                <p className="text-sm font-bold text-slate-800">{bookingData.rute.stasiunTujuan}</p>
                <p className="text-xs text-slate-400">{bookingData.rute.kotaTujuan}</p>
                <p className="text-sm font-black text-orange-600 mt-2">{bookingData.rute.waktuTiba}</p>
              </div>

            </div>
          </div>

          {/* PERFORASI TIKET DENGAN LUBANG KUPON (TICKET NOTCH) */}
          <div className="relative py-2 flex items-center justify-between">
            <div className="w-6 h-10 bg-slate-100 rounded-r-full -ml-3 border-r border-slate-200" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3" />
            <div className="w-6 h-10 bg-slate-100 rounded-l-full -mr-3 border-l border-slate-200" />
          </div>

          {/* BAGIAN BAWAH: QR CODE & DAFTAR PENUMPANG */}
          <div className="p-6 sm:p-8 bg-slate-50/60">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* QR CODE BOARDING SCANNER */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
                {/* QR Code Container */}
                <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-inner mb-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      bookingData.kodeBooking
                    )}`}
                    alt={`QR Code Boarding ${bookingData.kodeBooking}`}
                    className="w-36 h-36 object-contain"
                  />
                </div>

                <span className="text-xs text-slate-400 font-medium block">Kode Booking:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-mono font-black text-slate-900 tracking-wider">
                    {bookingData.kodeBooking}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    title="Salin Kode Booking"
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tunjukkan QR code ini kepada petugas di gate stasiun saat boarding.
                </p>
              </div>

              {/* DATA IDENTITAS & ALOKASI KURSI PENUMPANG */}
              <div className="md:col-span-8 space-y-4">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">
                  Manifest Penumpang
                </span>

                <div className="space-y-3">
                  {bookingData.penumpang.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          P{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{p.nama}</p>
                          <p className="text-xs font-mono text-slate-500">NIK: {p.identitas}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            {p.namaGerbong}
                          </span>
                          <span className="text-lg font-mono font-black text-blue-600">
                            Kursi {p.nomorKursi}
                          </span>
                        </div>

                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          p.statusTiket === 'BOARDED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.statusTiket === 'BOARDED' ? 'Sudah Boarding' : 'Booked'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ketentuan Keberangkatan */}
                <div className="mt-4 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    Ketentuan Boarding Stasiun:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                    <li>Boarding dibuka 60 menit sebelum keberangkatan kereta.</li>
                    <li>Wajib menunjukkan kartu identitas asli (KTP / Paspor) saat verifikasi scanner.</li>
                    <li>E-tiket ini sah dan diakui resmi oleh PT Kereta Api Indonesia.</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>

          {/* FOOTER STRIP */}
          <div className="p-4 bg-slate-900 text-slate-400 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2 px-8">
            <p>PT Kereta Api Indonesia (Persero) • Tiket Elektronik</p>
            <p className="text-slate-500">Dicetak Otomatis pada {new Date().toLocaleDateString('id-ID')}</p>
          </div>

        </div>

      </div>

    </div>
  );
}