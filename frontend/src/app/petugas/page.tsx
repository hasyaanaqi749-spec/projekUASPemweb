"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { demoBookings } from "@/lib/demo-data";

export default function PetugasPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [checkedCode, setCheckedCode] = useState("");

  const booking = demoBookings.find(
    (item) => item.code.toLowerCase() === checkedCode.toLowerCase()
  );

  function checkTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCheckedCode(bookingCode.trim());
  }

  return (
    <main className="container py-8">
      <div className="grid items-start gap-6 md:grid-cols-[256px_1fr]">
        <DashboardSidebar role="petugas" />

        <section>
          <p className="eyebrow">Petugas Kereta</p>
          <h1 className="mt-2 text-3xl font-black">Dashboard Petugas</h1>
          <p className="mt-2 muted">
            Periksa kode pemesanan penumpang.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="stat-card">
              <p className="text-sm muted">Data Pemesanan Demo</p>
              <p className="mt-2 text-3xl font-black">{demoBookings.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm muted">Pembayaran Lunas</p>
              <p className="mt-2 text-3xl font-black text-green-600">
                {demoBookings.filter((item) => item.status === "PAID").length}
              </p>
            </div>
          </div>

          <form onSubmit={checkTicket} className="panel mt-6">
            <h2 className="text-xl font-extrabold">Pemeriksaan Tiket</h2>
            <p className="mt-2 text-sm muted">
              Masukkan kode booking untuk memeriksa data pemesanan.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                className="field"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Contoh: RLK-20261101-001"
                required
              />
              <button type="submit" className="btn shrink-0">
                Periksa Tiket
              </button>
            </div>

            {checkedCode && (
              <div className="mt-6 rounded-xl border p-5">
                {booking ? (
                  <>
                    <p className="font-bold text-green-700">
                      Data pemesanan ditemukan
                    </p>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <p>Kode: <strong>{booking.code}</strong></p>
                      <p>Penumpang: <strong>{booking.passenger}</strong></p>
                      <p>Kereta: <strong>{booking.train}</strong></p>
                      <p>Rute: <strong>{booking.route}</strong></p>
                      <p>Tanggal: <strong>{booking.date}</strong></p>
                      <p>Status: <strong>{booking.status}</strong></p>
                    </div>
                    {booking.status === "PAID" ? (
                      <p className="mt-4 font-bold text-green-700">
                        Pembayaran telah lunas.
                      </p>
                    ) : (
                      <p className="mt-4 font-bold text-orange-600">
                        Tiket belum dibayar.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-semibold text-red-600">
                    Kode booking tidak ditemukan pada data demo.
                  </p>
                )}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}