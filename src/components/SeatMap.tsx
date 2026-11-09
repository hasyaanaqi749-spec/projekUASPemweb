// src/components/SeatMap.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Komponen Visual Denah Gerbong & Peta Kursi Kereta Interaktif
// ========================================================================

'use client';

import React, { useState } from 'react';
import { Train, User, Info, Check } from 'lucide-react';

export interface SeatInfo {
  id: string;
  nomorKursi: string; // misal '1A', '1B', '2C'
  status: 'KOSONG' | 'TERISI' | 'DIPILIH';
  penumpangNama?: string;
}

interface SeatMapProps {
  activePassengerIndex: number;
  activePassengerName: string;
  selectedSeats: { [passengerIndex: number]: { nomorKursi: string; gerbong: string; id: string } };
  onSeatSelect: (passengerIndex: number, seat: { id: string; nomorKursi: string; gerbong: string }) => void;
  kelasKereta?: 'EKSEKUTIF' | 'BISNIS' | 'EKONOMI';
}

export const SeatMap: React.FC<SeatMapProps> = ({
  activePassengerIndex,
  activePassengerName,
  selectedSeats,
  onSeatSelect,
  kelasKereta = 'EKSEKUTIF',
}) => {
  // Pilihan Gerbong
  const gerbongList = [
    { id: 'gb-1', label: `${kelasKereta} 1`, nomor: 1 },
    { id: 'gb-2', label: `${kelasKereta} 2`, nomor: 2 },
    { id: 'gb-3', label: `${kelasKereta} 3`, nomor: 3 },
  ];

  const [activeGerbong, setActiveGerbong] = useState<string>(gerbongList[0].label);

  // Daftar kursi yang sudah di-booking oleh orang lain (Simulasi Database)
  const occupiedSeatsInDb: { [gerbong: string]: string[] } = {
    [`${kelasKereta} 1`]: ['1B', '2A', '2B', '4D', '6A', '7C', '8B', '10A'],
    [`${kelasKereta} 2`]: ['1A', '3C', '3D', '5A', '5B', '9C', '9D'],
    [`${kelasKereta} 3`]: ['2C', '2D', '4A', '7B', '8A'],
  };

  // Baris Kursi: 1 sampai 10
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  // Periksa apakah kursi ini sedang dipilih oleh penumpang dalam transaksi ini
  const getSeatSelectionInfo = (nomorKursi: string) => {
    for (const [pIdx, val] of Object.entries(selectedSeats)) {
      if (val.nomorKursi === nomorKursi && val.gerbong === activeGerbong) {
        return { isSelected: true, passengerIndex: Number(pIdx) };
      }
    }
    return { isSelected: false, passengerIndex: -1 };
  };

  const handleSeatClick = (nomorKursi: string) => {
    // 1. Cek apakah kursi sudah diisi orang lain di database
    const occupiedInThisGerbong = occupiedSeatsInDb[activeGerbong] || [];
    if (occupiedInThisGerbong.includes(nomorKursi)) {
      return; // Tidak bisa diklik karena sudah dibeli orang lain
    }

    // 2. Berikan kursi ini ke penumpang yang sedang aktif dipilih tab-nya
    onSeatSelect(activePassengerIndex, {
      id: `seat-${activeGerbong}-${nomorKursi}`,
      nomorKursi,
      gerbong: activeGerbong,
    });
  };

  const renderSeatButton = (row: number, col: 'A' | 'B' | 'C' | 'D') => {
    const nomorKursi = `${row}${col}`;
    const occupiedInThisGerbong = occupiedSeatsInDb[activeGerbong] || [];
    const isOccupied = occupiedInThisGerbong.includes(nomorKursi);
    const { isSelected, passengerIndex } = getSeatSelectionInfo(nomorKursi);
    const isSelectedByActivePassenger = isSelected && passengerIndex === activePassengerIndex;

    // Menentukan Style Warna Kursi
    let bgClasses = 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-400 cursor-pointer';
    let label = nomorKursi;

    if (isOccupied) {
      // MERAH: Sudah Terisi / Di-booking orang lain
      bgClasses = 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed select-none opacity-80';
    } else if (isSelected) {
      // HIJAU: Dipilih oleh transaksi ini
      if (isSelectedByActivePassenger) {
        bgClasses = 'bg-emerald-600 border-emerald-700 text-white shadow-md ring-4 ring-emerald-300/60 font-bold scale-105';
      } else {
        bgClasses = 'bg-emerald-500 border-emerald-600 text-white font-semibold shadow-sm';
      }
      label = `P${passengerIndex + 1}`;
    }

    return (
      <button
        key={nomorKursi}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSeatClick(nomorKursi)}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center text-xs transition-all duration-150 ${bgClasses}`}
        title={
          isOccupied
            ? `Kursi ${nomorKursi} (Sudah Terisi)`
            : isSelected
            ? `Kursi ${nomorKursi} (Dipilih Penumpang ${passengerIndex + 1})`
            : `Pilih Kursi ${nomorKursi}`
        }
      >
        <span className="font-mono text-[11px] leading-tight font-bold">{nomorKursi}</span>
        {isSelected && (
          <span className="text-[9px] uppercase tracking-wider font-extrabold -mt-0.5">
            P{passengerIndex + 1}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* 1. Header & Tab Pilihan Gerbong */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Train className="w-5 h-5 text-blue-600" />
            <span>Pilih Kursi Gerbong</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sedang memilih untuk:{' '}
            <strong className="text-blue-600 font-bold">
              Penumpang {activePassengerIndex + 1} ({activePassengerName || 'Tanpa Nama'})
            </strong>
          </p>
        </div>

        {/* Tab Gerbong */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {gerbongList.map((gb) => (
            <button
              key={gb.id}
              type="button"
              onClick={() => setActiveGerbong(gb.label)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGerbong === gb.label
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {gb.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Legenda Status Warna Kursi */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 my-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-slate-100 border border-slate-300" />
          <span className="text-slate-600 font-medium">Tersedia (Kosong)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-emerald-600 border border-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-emerald-700 font-bold">Kursi Pilihan Anda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 text-red-400 flex items-center justify-center text-[10px] font-bold">
            ✕
          </div>
          <span className="text-red-500 font-medium">Sudah Terisi (Booked)</span>
        </div>
      </div>

      {/* 3. Denah Fisik Gerbong Kereta */}
      <div className="mt-6 max-w-md mx-auto bg-slate-100/70 p-5 rounded-3xl border-2 border-dashed border-slate-200">
        
        {/* Kepala Gerbong / Pintu Depan */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 pb-4 border-b border-slate-200 mb-4">
          <span>Depan / Pintu Masuk</span>
          <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px]">
            {activeGerbong}
          </span>
        </div>

        {/* Label Kolom Kursi (A B - Lorong - C D) */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-black text-slate-500 mb-2">
          <div>A</div>
          <div>B</div>
          <div className="text-[10px] text-slate-400 font-normal uppercase flex items-center justify-center">
            Lorong
          </div>
          <div>C</div>
          <div>D</div>
        </div>

        {/* Daftar Baris Kursi */}
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row} className="grid grid-cols-5 gap-2 items-center">
              {/* Kolom A & B (Sisi Kiri) */}
              {renderSeatButton(row, 'A')}
              {renderSeatButton(row, 'B')}

              {/* Lorong Jalan Tengah */}
              <div className="text-center font-mono text-[11px] font-bold text-slate-400 select-none">
                {row}
              </div>

              {/* Kolom C & D (Sisi Kanan) */}
              {renderSeatButton(row, 'C')}
              {renderSeatButton(row, 'D')}
            </div>
          ))}
        </div>

        {/* Toilet / Pintu Belakang */}
        <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-5 border-t border-slate-200 mt-5">
          Belakang / Toilet &amp; Bordes
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-2 text-xs text-blue-800">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          Klik nomor kursi untuk menetapkannya ke penumpang yang aktif. Penumpang lain dapat memilih di gerbong yang sama atau berbeda.
        </span>
      </div>
    </div>
  );
};