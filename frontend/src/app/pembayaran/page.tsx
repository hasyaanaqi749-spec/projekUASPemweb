"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatRupiah } from "@/lib/demo-data";

interface BookingData {
  code: string;
  trainName: string;
  origin: string;
  destination: string;
  date: string;
  passenger: string;
  total: number;
  status: string;
}

export default function PembayaranPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [method, setMethod] = useState("Transfer Bank");

  useEffect(() => {
    const saved = localStorage.getItem("railink-booking");
    if (saved) setBooking(JSON.parse(saved));
  }, []);

  function handlePayment() {
    if (!booking) return;

    const updated = { ...booking, status: "PAID", method };
    localStorage.setItem("railink-booking", JSON.stringify(updated));
    router.push("/tiket");
  }

  if (!booking) {
    return (
      <main className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Belum ada pemesanan</h1>
        <Link href="/jadwal" className="btn mt-5">
          Cari Kereta
        </Link>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-12">
        <h1 className="section-title">Pembayaran</h1>
        <p className="mt-2 muted">Periksa pesanan sebelum menyelesaikan pembayaran.</p>

        <div className="mt-8 grid items-start gap-6 md:grid-cols-[1.2fr_.8fr]">
          <section className="panel">
            <h2 className="text-xl font-extrabold">Ringkasan Pemesanan</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="muted">Kode pemesanan</span>
                <strong>{booking.code}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="muted">Nama penumpang</span>
                <strong>{booking.passenger}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="muted">Kereta</span>
                <strong>{booking.trainName}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="muted">Rute</span>
                <strong>{booking.origin} - {booking.destination}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="muted">Tanggal</span>
                <strong>{booking.date}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2 className="text-xl font-extrabold">Metode Pembayaran</h2>

            <div className="mt-5 space-y-3">
              {["Transfer Bank", "Virtual Account", "E-Wallet"].map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-4"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={item}
                    checked={method === item}
                    onChange={() => setMethod(item)}
                  />
                  <span className="font-semibold">{item}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm muted">Total pembayaran</p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {formatRupiah(booking.total)}
              </p>
              <button onClick={handlePayment} className="btn mt-5 w-full">
                Bayar Sekarang
              </button>
              <p className="mt-3 text-center text-xs muted">
                Simulasi pembayaran untuk frontend demo.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}