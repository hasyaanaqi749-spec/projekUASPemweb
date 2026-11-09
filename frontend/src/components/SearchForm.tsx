"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm() {
  const router = useRouter();

  const [origin, setOrigin] = useState("Jakarta");
  const [destination, setDestination] = useState("Surabaya");
  const [date, setDate] = useState("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const params = new URLSearchParams({
      origin,
      destination,
      date,
    });

    router.push(`/jadwal?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="grid gap-4 rounded-2xl bg-white p-5 shadow-xl md:grid-cols-4"
    >
      <div>
        <label className="mb-2 block text-sm font-bold">Stasiun Asal</label>
        <select
          className="field"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        >
          <option>Jakarta</option>
          <option>Surabaya</option>
          <option>Malang</option>
          <option>Yogyakarta</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold">Stasiun Tujuan</label>
        <select
          className="field"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option>Surabaya</option>
          <option>Jakarta</option>
          <option>Malang</option>
          <option>Yogyakarta</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold">Tanggal Berangkat</label>
        <input
          type="date"
          className="field"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex items-end">
        <button type="submit" className="btn w-full">
          Cari Kereta
        </button>
      </div>
    </form>
  );
}