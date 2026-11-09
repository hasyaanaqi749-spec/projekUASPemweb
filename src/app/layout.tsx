// src/app/layout.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Root Layout Utama Frontend (Font, Provider, Navbar, & Metadata)
// ========================================================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Import Context Provider dan Navbar yang sudah dibuat
import { BookingProvider } from "@/context/BookingContext";
import { Navbar } from "@/components/Navbar";

// Setup font bawaan Next.js
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Metadata Resmi Aplikasi Kereta Api
export const metadata: Metadata = {
  title: "Railink - Sistem Pemesanan Tiket Kereta Api | Kelompok 14",
  description: "Aplikasi pemesanan tiket kereta api online cepat, mudah, dan terintegrasi real-time dengan Supabase & Next.js App Router.",
  icons: {
    icon: "/favicon.ico",
  },
};

// 3. Root Layout Frontend
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* BookingProvider membungkus seluruh aplikasi agar state pencarian tiket bisa dipakai di mana saja */}
        <BookingProvider>
          {/* Header & Navbar Navigasi Utama */}
          <Navbar />

          {/* Konten Halaman Aktif (page.tsx) */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer Sederhana Frontend */}
          <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 Railink KAI. Projek UAS Pemrograman Web - Kelompok 14.</p>
              <p className="text-slate-500">Next.js App Router • Tailwind CSS • Supabase</p>
            </div>
          </footer>
        </BookingProvider>
      </body>
    </html>
  );
}