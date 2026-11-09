import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import TrainCard from "@/components/TrainCard";
import { demoTrains } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero-pattern px-5 pb-24 pt-20 text-white md:pt-28">
          <div className="container">
            <div className="max-w-2xl">
              <span className="eyebrow">Perjalanan lebih mudah</span>
              <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                Pesan Tiket Kereta Api dengan Mudah dan Nyaman
              </h1>
              <p className="mt-5 max-w-xl leading-7 text-gray-300">
                Temukan jadwal perjalanan, pilih kereta favorit, dan pesan
                tiket perjalananmu melalui Railink.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/jadwal" className="btn btn-orange">
                  Lihat Jadwal Kereta
                </Link>
                <Link href="/register" className="btn btn-outline">
                  Buat Akun
                </Link>
              </div>
            </div>

            <div className="mt-14">
              <SearchForm />
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Pilihan perjalanan</span>
              <h2 className="section-title mt-2">Kereta Populer</h2>
              <p className="mt-2 muted">
                Beberapa pilihan kereta untuk perjalanan Anda.
              </p>
            </div>
            <Link href="/jadwal" className="font-bold text-blue-700">
              Lihat semua jadwal →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {demoTrains.slice(0, 4).map((train) => (
              <TrainCard key={train.id} train={train} />
            ))}
          </div>
        </section>

        <section className="container pb-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Cari Perjalanan", "Temukan jadwal kereta sesuai tujuan."],
              ["02", "Pesan Tiket", "Isi data penumpang dan pilih perjalanan."],
              ["03", "Selesaikan Pembayaran", "Lanjutkan proses pembayaran tiket."],
            ].map(([number, title, description]) => (
              <div className="stat-card" key={number}>
                <span className="text-3xl font-black text-orange-500">
                  {number}
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}