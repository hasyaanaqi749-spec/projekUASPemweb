"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrainCard from "@/components/TrainCard";
import { demoTrains } from "@/lib/demo-data";

export default function JadwalPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrigin(params.get("origin") || "");
    setDestination(params.get("destination") || "");
    setDate(params.get("date") || "");
  }, []);

  const filteredTrains = useMemo(() => {
    return demoTrains.filter((train) => {
      const matchOrigin =
        !origin || train.origin.toLowerCase().includes(origin.toLowerCase());
      const matchDestination =
        !destination ||
        train.destination.toLowerCase().includes(destination.toLowerCase());

      return matchOrigin && matchDestination;
    });
  }, [origin, destination]);

  return (
    <>
      <Navbar />
      <main className="container py-12">
        <span className="eyebrow">Informasi perjalanan</span>
        <h1 className="section-title mt-2">Jadwal Kereta Api</h1>
        <p className="mt-2 muted">
          Temukan kereta yang sesuai dengan rencana perjalanan Anda.
        </p>

        <div className="panel mt-8 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold">Stasiun Asal</label>
            <select
              className="field"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              <option value="">Semua stasiun</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Malang">Malang</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Stasiun Tujuan</label>
            <select
              className="field"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="">Semua tujuan</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Malang">Malang</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Tanggal</label>
            <input
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Hasil Pencarian</h2>
          <span className="text-sm muted">
            {filteredTrains.length} kereta ditemukan
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {filteredTrains.length > 0 ? (
            filteredTrains.map((train) => (
              <TrainCard key={train.id} train={train} />
            ))
          ) : (
            <div className="panel md:col-span-2">
              <p className="text-center muted">
                Tidak ada jadwal kereta yang sesuai dengan pencarian.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}