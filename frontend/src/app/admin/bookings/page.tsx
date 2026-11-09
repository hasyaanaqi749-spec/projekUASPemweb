import DashboardSidebar from "@/components/DashboardSidebar";
import { demoBookings, formatRupiah } from "@/lib/demo-data";

export default function AdminBookingsPage() {
  return (
    <main className="container py-8">
      <div className="grid items-start gap-6 md:grid-cols-[256px_1fr]">
        <DashboardSidebar role="admin" />

        <section className="min-w-0">
          <p className="eyebrow">Administrator</p>
          <h1 className="mt-2 text-3xl font-black">Data Pemesanan</h1>
          <p className="mt-2 muted">
            Daftar transaksi pemesanan tiket pada sistem.
          </p>

          <div className="panel mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Semua Pemesanan</h2>
              <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                {demoBookings.length} data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Kode Booking</th>
                    <th className="p-3">Penumpang</th>
                    <th className="p-3">Kereta</th>
                    <th className="p-3">Rute</th>
                    <th className="p-3">Tanggal</th>
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
                      <td className="p-3">{booking.route}</td>
                      <td className="p-3">{booking.date}</td>
                      <td className="p-3">{formatRupiah(booking.total)}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          booking.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {booking.status}
                        </span>
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