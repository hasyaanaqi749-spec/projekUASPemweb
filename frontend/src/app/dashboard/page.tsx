"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { demoBookings, formatRupiah } from "@/lib/demo-data";

export default function DashboardPage() {
  const [name, setName] = useState("Penumpang");

  useEffect(() => {
    const saved = localStorage.getItem("railink-user");
    if (saved) {
      const user = JSON.parse(saved);
      setName(user.name || "Penumpang");
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="container py-12">
        <div className="panel hero-pattern text-white">
          <p className="text-sm text-gray-300">Dashboard Penumpang</p>
          <h1 className="mt-2 text-3xl font-black">
            Halo, {name}!
          </h1>
          <p className="mt-3 text-gray-300">
            Selamat datang kembali di Railink.
          </p>
          <Link href="/jadwal" className="btn btn-orange mt-6">
            Pesan Tiket Sekarang
          </Link>
        </div>

        <h2 className="section-title mt-10">Ringkasan Pemesanan</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="stat-card">
            <p className="text-sm muted">Total Pemesanan</p>
            <p className="mt-2 text-3xl font-black">2</p>
          </div>
          <div className="stat-card">
            <p className="text-sm muted">Pembayaran Berhasil</p>
            <p className="mt-2 text-3xl font-black text-green-600">1</p>
          </div>
          <div className="stat-card">
            <p className="text-sm muted">Menunggu Pembayaran</p>
            <p className="mt-2 text-3xl font-black text-orange-500">1</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <h2 className="section-title">Pemesanan Terbaru</h2>
          <Link href="/tiket" className="text-sm font-bold text-blue-700">
            Lihat tiket
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {demoBookings.map((booking) => (
            <div
              key={booking.id}
              className="panel flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-extrabold">{booking.train}</p>
                <p className="mt-1 text-sm muted">{booking.route}</p>
                <p className="mt-1 text-xs muted">{booking.code}</p>
              </div>
              <div>
                <p className="font-bold">{formatRupiah(booking.total)}</p>
                <span className="text-xs font-bold text-blue-700">
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}