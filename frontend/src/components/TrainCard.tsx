import Link from "next/link";
import type { Train } from "@/types/railink";
import { formatRupiah } from "@/lib/demo-data";

export default function TrainCard({ train }: { train: Train }) {
  return (
    <article className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="eyebrow">{train.className}</span>
          <h3 className="mt-2 text-xl font-extrabold">{train.name}</h3>
          <p className="mt-1 text-sm muted">{train.code}</p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {train.availableSeats} kursi tersedia
        </span>
      </div>

      <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="text-2xl font-extrabold">{train.departure}</p>
          <p className="text-sm muted">{train.origin}</p>
        </div>

        <div className="text-center">
          <p className="text-xs muted">{train.duration}</p>
          <div className="mt-2 h-px w-16 bg-gray-300" />
          <p className="mt-2 text-xs muted">Kereta</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-extrabold">{train.arrival}</p>
          <p className="text-sm muted">{train.destination}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
        <div>
          <p className="text-xs muted">Harga mulai</p>
          <p className="text-xl font-extrabold text-blue-700">
            {formatRupiah(train.price)}
          </p>
        </div>

        <Link href={`/pesan?trainId=${train.id}`} className="btn">
          Pesan Tiket
        </Link>
      </div>
    </article>
  );
}