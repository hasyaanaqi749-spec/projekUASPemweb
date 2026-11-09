// src/types/booking.ts
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// TypeScript Definitions untuk Client-Side & Booking Flow
// ========================================================================

export type UserRole = 'PENUMPANG' | 'PETUGAS' | 'ADMIN';
export type KelasKereta = 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI';
export type StatusBayar = 'PENDING' | 'PAID' | 'CANCELLED';
export type StatusTiket = 'BOOKED' | 'BOARDED';

// 1. Data Stasiun
export interface Stasiun {
  id: string;
  kodeStasiun: string; // contoh: 'GMR', 'PSE', 'BD', 'YK', 'SGU'
  namaStasiun: string; // contoh: 'Gambir', 'Yogyakarta'
  kota: string;        // contoh: 'Jakarta Pusat', 'Yogyakarta'
  createdAt?: string;
  updatedAt?: string;
}

// 2. Data Kereta & Gerbong
export interface Kereta {
  id: string;
  namaKereta: string; // contoh: 'Taksaka Malam', 'Argo Bromo Anggrek'
  kodeKereta: string; // contoh: 'KA-67'
}

export interface Gerbong {
  id: string;
  keretaId: string;
  namaGerbong: string;  // contoh: 'Eksekutif 1'
  nomorGerbong: number; // 1, 2, 3
  kelas: KelasKereta;
  kursi?: Kursi[];
}

// 3. Data Kursi
export interface Kursi {
  id: string;
  gerbongId: string;
  nomorKursi: string; // contoh: '1A', '1B', '2C'
  isAvailable?: boolean; // kalkulasi ketersediaan saat memilih kursi
  gerbong?: Gerbong;
}

// 4. Data Rute & Tarif
export interface Rute {
  id: string;
  stasiunAsalId: string;
  stasiunTujuanId: string;
  jarakKm: number;
  stasiunAsal?: Stasiun;
  stasiunTujuan?: Stasiun;
}

export interface Tarif {
  id: string;
  ruteId: string;
  kelas: KelasKereta;
  harga: number; // dalam Rupiah
}

// 5. Data Jadwal Perjalanan
export interface Jadwal {
  id: string;
  keretaId: string;
  ruteId: string;
  waktuBerangkat: string; // ISO string Date
  waktuTiba: string;      // ISO string Date
  kereta: Kereta;
  rute: {
    stasiunAsal: Stasiun;
    stasiunTujuan: Stasiun;
    jarakKm: number;
  };
  tarif?: Tarif[];
  sisaKursi?: number;
  hargaMulai?: number;
}

// 6. Data Penumpang Perseorangan (Form Input di Frontend)
export interface PenumpangInput {
  id: string; // Client temporary ID (uuid/timestamp)
  nama: string;
  identitas: string; // NIK KTP atau Paspor
  tipeIdentitas: 'NIK' | 'PASPOR';
  kursiId?: string;
  nomorKursi?: string;
  namaGerbong?: string;
}

// 7. Data Pemesanan (Order Header & Detail Tiket)
export interface DetailTiketItem {
  id: string;
  pemesananId: string;
  jadwalId: string;
  penumpangNama: string;
  penumpangIdentitas: string;
  kursiId: string;
  statusTiket: StatusTiket;
  kursi?: {
    nomorKursi: string;
    gerbong?: {
      namaGerbong: string;
      nomorGerbong: number;
      kelas: KelasKereta;
    };
  };
}

export interface Pemesanan {
  id: string;
  kodeBooking: string; // contoh: 'KAI-7A89X'
  userId: string;
  jadwalId: string;
  statusPembayaran: StatusBayar;
  totalBayar: number;
  createdAt: string;
  expiredAt: string;
  jadwal?: Jadwal;
  detailTiket?: DetailTiketItem[];
  user?: {
    nama: string;
    email: string;
    phone: string;
  };
}

// 8. Search Query State (Form Pencarian di Home)
export interface SearchQuery {
  stasiunAsal: Stasiun | null;
  stasiunTujuan: Stasiun | null;
  tanggalBerangkat: string; // format 'YYYY-MM-DD'
  jumlahPenumpang: number;   // minimal 1, maksimal 4
  kelas: KelasKereta | 'SEMUA';
}