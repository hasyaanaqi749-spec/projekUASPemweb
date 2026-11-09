"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { demoTrains, formatRupiah } from "@/lib/demo-data";
import type { Train } from "@/types/railink";

export default function PesanPage() {
  const router = useRouter();
  const [train, setTrain] = useState<Train | null>(null);
  const [date, setDate] = useState("");
  const [passenger, setPassenger] = useState("");
  const [identity, setIdentity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trainId = params.get("trainId") || "1";
    const selected = demoTrains.find((item) => item.id === trainId);
    setTrain(selected || demoTrains[0]);
  }, []);

  function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!train) return;

    const booking = {
      code: `RLK-${Date.now()}`,
      trainId: train.id,
      trainName: train.name,
      origin: train.origin,
      destination: train.destination,
      date,
      passenger,
      identity,
      total: train.price,
      status: "PENDING",
    };

    localStorage.setItem("railink-booking", JSON.stringify(booking));
    router.push("/pembayaran");
  }

  if (!train) {
    return <div className="p-10 text-center">Memuat data kereta...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="container py-12">
        <h1 className="section-title">Form Pemesanan Tiket</h1>
        <p className="mt-2 muted">
          Lengkapi informasi perjalanan dan data penumpang.
        </p>

        <div className="mt-8 grid items-start gap-6 md:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={handleBooking} className="panel space-y-5">
            <h2 className="text-xl font-extrabold">Data Penumpang</h2>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Nama Lengkap
              </label>
              <input
                className="field"
                value={passenger}
                onChange={(e) => setPassenger(e.target.value)}
                placeholder="Nama sesuai identitas"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                NIK / Nomor Identitas
              </label>
              <input
                className="field"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Masukkan nomor identitas"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Tanggal Keberangkatan
              </label>
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="btn w-full">
              Lanjut ke Pembayaran
            </button>
          </form>

          <div className="panel">
            <h2 className="text-xl font-extrabold">Detail Perjalanan</h2>
            <p className="mt-5 text-lg font-bold">{train.name}</p>
            <p className="text-sm muted">{train.code} · {train.className}</p>

            <div className="my-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs muted">Keberangkatan</p>
                <p className="mt-1 text-xl font-extrabold">{train.departure}</p>
                <p className="text-sm">{train.origin}</p>
              </div>
              <div>
                <p className="text-xs muted">Kedatangan</p>
                <p className="mt-1 text-xl font-extrabold">{train.arrival}</p>
                <p className="text-sm">{train.destination}</p>
              </div>
            </div>

            <div className="border-t pt-5">
              <p className="text-sm muted">Total pembayaran</p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {formatRupiah(train.price)}
              </p>
            </div>

            <Link href="/jadwal" className="mt-5 block text-sm text-blue-700">
              ← Pilih kereta lain
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}