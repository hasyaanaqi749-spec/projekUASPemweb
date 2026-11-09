"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#10243b] text-white shadow-lg">
      <div className="container flex min-h-[76px] items-center justify-between gap-5">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Rail<span className="text-orange-400">ink.</span>
        </Link>

        <button
          className="text-2xl md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Buka menu"
        >
          ☰
        </button>

        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 top-[76px] w-full flex-col gap-5 bg-[#10243b] p-6 md:static md:flex md:w-auto md:flex-row md:items-center md:bg-transparent md:p-0`}
        >
          <Link href="/" className="nav-link">Beranda</Link>
          <Link href="/jadwal" className="nav-link">Jadwal Kereta</Link>
          <Link href="/tiket" className="nav-link">Cek Tiket</Link>
          <Link href="/login" className="nav-link">Masuk</Link>
          <Link href="/register" className="btn btn-orange">
            Daftar
          </Link>
        </nav>
      </div>
    </header>
  );
}