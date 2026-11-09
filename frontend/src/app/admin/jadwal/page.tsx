"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { demoTrains, formatRupiah } from "@/lib/demo-data";
import type { Train } from "@/types/railink";

export default function AdminJadwalPage() {
  const [trains, setTrains] = useState<Train[]>(demoTrains);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [origin, setOrigin] = useState("Jakarta");
  const [destination, setDestination] = useState("Surabaya");
  const [departure, setDeparture] = useState("08:00");
  const [arrival, setArrival] = useState("16:30");
  const [price, setPrice] = useState("250000");
  const [className, setClassName] = useState("Ekonomi");

  function addTrain(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newTrain: Train = {
      id: Date.now().toString(),
      code,
      name,
      className,
      origin,
      destination,
      departure,
      arrival,
      duration: "Belum ditentukan",
      price: Number(price),
      availableSeats: 50,
    };

    setTrains((current) => [...current, newTrain]);
    setName("");
    setCode("");
    setPrice("250000");
  }

  function deleteTrain(id: string) {
    setTrains((current) => current.filter((train) => train.id !== id));
  }

  return (
    <main className="container py-8">
      <div className="grid items-start gap-6 md:grid-cols-[256px_1fr]">
        <DashboardSidebar role="admin" />

        <section className="min-w-0">
          <p className="eyebrow">Administrator</p>
          <h1 className="mt-2 text-3xl font-black">Kelola Jadwal Kereta</h1>
          <p className="mt-2 muted">
            Tambahkan dan hapus data jadwal kereta.
          </p>

          <form onSubmit={addTrain} className="panel mt-8 space-y-5">
            <h2 className="text-xl font-extrabold">Tambah Jadwal</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">Nama Kereta</label>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kereta"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Kode Kereta</label>
                <input
                  className="field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="KA006"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Stasiun Asal</label>
                <select className="field" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                  <option>Jakarta</option>
                  <option>Surabaya</option>
                  <option>Malang</option>
                  <option>Yogyakarta</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Stasiun Tujuan</label>
                <select className="field" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  <option>Surabaya</option>
                  <option>Jakarta</option>
                  <option>Malang</option>
                  <option>Yogyakarta</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Waktu Berangkat</label>
                <input
                  type="time"
                  className="field"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Waktu Tiba</label>
                <input
                  type="time"
                  className="field"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Kelas Kereta</label>
                <select className="field" value={className} onChange={(e) => setClassName(e.target.value)}>
                  <option>Ekonomi</option>
                  <option>Eksekutif</option>
                  <option>Bisnis</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Harga Tiket</label>
                <input
                  type="number"
                  min="1"
                  className="field"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn">
              Tambahkan Jadwal
            </button>
          </form>

          <div className="panel mt-6">
            <h2 className="text-xl font-extrabold">Daftar Jadwal</h2>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Kereta</th>
                    <th className="p-3">Rute</th>
                    <th className="p-3">Berangkat</th>
                    <th className="p-3">Tiba</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map((train) => (
                    <tr key={train.id} className="border-b">
                      <td className="p-3">
                        <p className="font-bold">{train.name}</p>
                        <p className="text-xs muted">{train.code}</p>
                      </td>
                      <td className="p-3">{train.origin} - {train.destination}</td>
                      <td className="p-3">{train.departure}</td>
                      <td className="p-3">{train.arrival}</td>
                      <td className="p-3">{formatRupiah(train.price)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteTrain(train.id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}