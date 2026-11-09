// src/context/BookingContext.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Global State Management: Pencarian Tiket, Pilihan Jadwal, & Kursi
// ========================================================================

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Stasiun, 
  Jadwal, 
  SearchQuery, 
  PenumpangInput, 
  KelasKereta 
} from '@/types/booking';

interface BookingContextType {
  // 1. Search Query State
  searchQuery: SearchQuery;
  setStasiunAsal: (stasiun: Stasiun | null) => void;
  setStasiunTujuan: (stasiun: Stasiun | null) => void;
  setTanggalBerangkat: (tanggal: string) => void;
  setJumlahPenumpang: (jumlah: number) => void;
  setKelasPilihan: (kelas: KelasKereta | 'SEMUA') => void;
  swapStasiun: () => void;

  // 2. Selected Schedule & Booking Flow State
  selectedJadwal: Jadwal | null;
  setSelectedJadwal: (jadwal: Jadwal | null) => void;

  // 3. Passenger Form State
  penumpangList: PenumpangInput[];
  setPenumpangList: React.Dispatch<React.SetStateAction<PenumpangInput[]>>;
  updatePenumpang: (index: number, field: keyof PenumpangInput, value: string) => void;
  assignKursiToPenumpang: (index: number, kursiId: string, nomorKursi: string, namaGerbong: string) => void;

  // 4. Utility Actions
  resetBooking: () => void;
  isSearchValid: boolean;
}

const STORAGE_KEY = 'kai_booking_draft_state';

// Default search: Hari ini
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const initialSearchQuery: SearchQuery = {
  stasiunAsal: null,
  stasiunTujuan: null,
  tanggalBerangkat: getTodayString(),
  jumlahPenumpang: 1,
  kelas: 'SEMUA',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(initialSearchQuery);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);
  const [penumpangList, setPenumpangList] = useState<PenumpangInput[]>([
    {
      id: 'penumpang-1',
      nama: '',
      identitas: '',
      tipeIdentitas: 'NIK',
    },
  ]);

  // Load draft dari sessionStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.selectedJadwal) setSelectedJadwal(parsed.selectedJadwal);
        if (parsed.penumpangList) setPenumpangList(parsed.penumpangList);
      }
    } catch (e) {
      console.warn('Gagal memuat draft booking dari sessionStorage', e);
    }
  }, []);

  // Simpan perubahan ke sessionStorage
  useEffect(() => {
    try {
      const payload = {
        searchQuery,
        selectedJadwal,
        penumpangList,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Gagal menyimpan draft booking ke sessionStorage', e);
    }
  }, [searchQuery, selectedJadwal, penumpangList]);

  // Handler Search Query
  const setStasiunAsal = (stasiun: Stasiun | null) => {
    setSearchQuery((prev) => ({ ...prev, stasiunAsal: stasiun }));
  };

  const setStasiunTujuan = (stasiun: Stasiun | null) => {
    setSearchQuery((prev) => ({ ...prev, stasiunTujuan: stasiun }));
  };

  const setTanggalBerangkat = (tanggal: string) => {
    setSearchQuery((prev) => ({ ...prev, tanggalBerangkat: tanggal }));
  };

  const setJumlahPenumpang = (jumlah: number) => {
    const validCount = Math.max(1, Math.min(4, jumlah));
    setSearchQuery((prev) => ({ ...prev, jumlahPenumpang: validCount }));

    // Sesuaikan panjang form penumpangList
    setPenumpangList((prev) => {
      const currentLen = prev.length;
      if (validCount > currentLen) {
        const tambahan: PenumpangInput[] = Array.from({ length: validCount - currentLen }).map((_, i) => ({
          id: `penumpang-${currentLen + i + 1}`,
          nama: '',
          identitas: '',
          tipeIdentitas: 'NIK',
        }));
        return [...prev, ...tambahan];
      } else if (validCount < currentLen) {
        return prev.slice(0, validCount);
      }
      return prev;
    });
  };

  const setKelasPilihan = (kelas: KelasKereta | 'SEMUA') => {
    setSearchQuery((prev) => ({ ...prev, kelas }));
  };

  // Menukar posisi stasiun asal dan tujuan
  const swapStasiun = () => {
    setSearchQuery((prev) => ({
      ...prev,
      stasiunAsal: prev.stasiunTujuan,
      stasiunTujuan: prev.stasiunAsal,
    }));
  };

  // Update identitas penumpang
  const updatePenumpang = (index: number, field: keyof PenumpangInput, value: string) => {
    setPenumpangList((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Alokasi kursi untuk penumpang tertentu
  const assignKursiToPenumpang = (
    index: number,
    kursiId: string,
    nomorKursi: string,
    namaGerbong: string
  ) => {
    setPenumpangList((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          kursiId,
          nomorKursi,
          namaGerbong,
        };
      }
      return updated;
    });
  };

  // Reset alur pesanan
  const resetBooking = () => {
    setSelectedJadwal(null);
    setPenumpangList([
      {
        id: 'penumpang-1',
        nama: '',
        identitas: '',
        tipeIdentitas: 'NIK',
      },
    ]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isSearchValid = Boolean(
    searchQuery.stasiunAsal &&
    searchQuery.stasiunTujuan &&
    searchQuery.stasiunAsal.id !== searchQuery.stasiunTujuan.id &&
    searchQuery.tanggalBerangkat
  );

  return (
    <BookingContext.Provider
      value={{
        searchQuery,
        setStasiunAsal,
        setStasiunTujuan,
        setTanggalBerangkat,
        setJumlahPenumpang,
        setKelasPilihan,
        swapStasiun,
        selectedJadwal,
        setSelectedJadwal,
        penumpangList,
        setPenumpangList,
        updatePenumpang,
        assignKursiToPenumpang,
        resetBooking,
        isSearchValid,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking harus digunakan di dalam komponen yang dibungkus <BookingProvider>');
  }
  return context;
};