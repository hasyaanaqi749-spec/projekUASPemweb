import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#10243b] py-12 text-white">
      <div className="container grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="mb-3 text-2xl font-black">
            Rail<span className="text-orange-400">ink.</span>
          </h2>
          <p className="max-w-sm text-sm leading-7 text-gray-300">
            Platform pemesanan tiket kereta api yang praktis,
            mudah, dan nyaman untuk perjalanan Anda.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Navigasi</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-300">
            <Link href="/">Beranda</Link>
            <Link href="/jadwal">Jadwal Kereta</Link>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Layanan</h3>
          <p className="text-sm leading-7 text-gray-300">
            Pemesanan tiket, informasi jadwal, pembayaran,
            dan informasi perjalanan kereta api.
          </p>
        </div>
      </div>

      <div className="container mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
        © 2026 Railink. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}