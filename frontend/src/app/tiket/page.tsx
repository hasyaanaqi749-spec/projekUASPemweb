"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  method?: string;
}

export default function TiketPage() {
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("railink-booking");
    if (saved) setBooking(JSON.parse(saved));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container min-h-[60vh] py-12">
        <h1 className="section-title">Tiket Saya</h1>
        <p className="mt-2 muted">Informasi tiket perjalanan Anda.</p>

        {!booking ? (
          <div className="panel mt-8 text-center">
            <p className="muted">Belum ada tiket yang dipesan.</p>
            <Link href="/jadwal" className="btn mt-5">
              Pesan Tiket
            </Link>
          </div>
        ) : (
          <div className="panel mt-8 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
              <div>
                <p className="text-sm muted">Kode Booking</p>
                <h2 className="text-xl font-black">{booking.code}</h2>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  booking.status === "PAID"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {booking.status === "PAID" ? "LUNAS" : "BELUM DIBAYAR"}
              </span>
            </div>

            <div className="grid gap-6 py-7 md:grid-cols-2">
              <div>
                <p className="text-sm muted">Nama Penumpang</p>
                <p className="mt-1 font-bold">{booking.passenger}</p>
              </div>
              <div>
                <p className="text-sm muted">Nama Kereta</p>
                <p className="mt-1 font-bold">{booking.trainName}</p>
              </div>
              <div>
                <p className="text-sm muted">Stasiun Asal</p>
                <p className="mt-1 text-xl font-black">{booking.origin}</p>
              </div>
              <div>
                <p className="text-sm muted">Stasiun Tujuan</p>
                <p className="mt-1 text-xl font-black">{booking.destination}</p>
              </div>
              <div>
                <p className="text-sm muted">Tanggal Keberangkatan</p>
                <p className="mt-1 font-bold">{booking.date}</p>
              </div>
              <div>
                <p className="text-sm muted">Total Pembayaran</p>
                <p className="mt-1 font-bold text-blue-700">
                  {formatRupiah(booking.total)}
                </p>
              </div>
            </div>

            <div className="border-t pt-5">
              <p className="text-sm muted">
                Ini merupakan tiket simulasi untuk tampilan frontend.
              </p>
              <button
                onClick={() => window.print()}
                className="btn mt-4"
              >
                Cetak Tiket
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}