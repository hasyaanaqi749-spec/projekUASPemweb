import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { demoBookings, demoTrains, formatRupiah } from "@/lib/demo-data";

export default function AdminPage() {
  const paid = demoBookings.filter((item) => item.status === "PAID").length;
  const pending = demoBookings.filter((item) => item.status === "PENDING").length;
  const revenue = demoBookings
    .filter((item) => item.status === "PAID")
    .reduce((total, item) => total + item.total, 0);

  return (
    <main className="container py-8">
      <div className="grid items-start gap-6 md:grid-cols-[256px_1fr]">
        <DashboardSidebar role="admin" />

        <section>
          <div className="mb-8">
            <p className="eyebrow">Administrator</p>
            <h1 className="mt-2 text-3xl font-black">Dashboard Admin</h1>
            <p className="mt-2 muted">Ringkasan aktivitas sistem Railink.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="stat-card">
              <p className="text-sm muted">Total Pemesanan</p>
              <p className="mt-2 text-3xl font-black">{demoBookings.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm muted">Pembayaran Lunas</p>
              <p className="mt-2 text-3xl font-black text-green-600">{paid}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm muted">Menunggu Pembayaran</p>
              <p className="mt-2 text-3xl font-black text-orange-500">{pending}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm muted">Total Pendapatan Demo</p>
              <p className="mt-2 text-xl font-black">{formatRupiah(revenue)}</p>
            </div>
          </div>

          <div className="panel mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Pemesanan Terbaru</h2>
              <Link href="/admin/bookings" className="text-sm font-bold text-blue-700">
                Lihat semua →
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Penumpang</th>
                    <th className="p-3">Kereta</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {demoBookings.map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-3 font-semibold">{booking.code}</td>
                      <td className="p-3">{booking.passenger}</td>
                      <td className="p-3">{booking.train}</td>
                      <td className="p-3">{formatRupiah(booking.total)}</td>
                      <td className="p-3">{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel mt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Jadwal Kereta</h2>
              <Link href="/admin/jadwal" className="text-sm font-bold text-blue-700">
                Kelola jadwal →
              </Link>
            </div>
            <p className="mt-2 text-sm muted">
              Terdapat {demoTrains.length} data kereta pada data demo.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}