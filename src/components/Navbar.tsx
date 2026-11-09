// src/components/Navbar.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Komponen Navbar Khusus: Terpisah Antara Penumpang, Admin, & Petugas
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Train, 
  Search, 
  Ticket, 
  History, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  QrCode,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

interface CurrentUser {
  id: string;
  nama: string;
  email: string;
  role: 'PENUMPANG' | 'PETUGAS' | 'ADMIN';
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Deteksi Portal
  const isAdminPortal = pathname.startsWith('/admin');
  const isPetugasPortal = pathname.startsWith('/petugas');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isSpecialPortal = isAdminPortal || isPetugasPortal || isAuthPage;

  // Ambil data user yang sedang login
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (e) {
        // Abaikan jika offline
      }
    };
    fetchSession();
  }, [pathname]);

  // Tutup menu mobile saat pindah rute
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  const passengerLinks = [
    { label: 'Cari Tiket', href: '/', icon: Search },
    { label: 'Cek Booking', href: '/cek-booking', icon: Ticket },
    { label: 'Riwayat Pesanan', href: '/tiket/riwayat', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1c3654] text-white shadow-md border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. BRAND LOGO RAILINK */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
              <Train className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  Rail<span className="text-orange-500">ink</span>.
                </span>
                
                {/* Badge Penanda Portal Khusus */}
                {isAdminPortal && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full">
                    Portal Admin
                  </span>
                )}
                {isPetugasPortal && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Portal Petugas
                  </span>
                )}
              </div>
              <span className="text-[10px] text-blue-200 tracking-wider font-semibold -mt-0.5 uppercase">
                Sistem Tiket KAI • Kelompok 14
              </span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* KONDISI A: JIKA DI PORTAL ADMIN ATAU PORTAL PETUGAS                 */}
          {/* (SEMBUNYIKAN CARI TIKET, CEK BOOKING, RIWAYAT, MASUK, DAN DAFTAR)   */}
          {/* =================================================================== */}
          {isSpecialPortal ? (
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ke Beranda Penumpang</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 hover:text-white bg-red-500/20 hover:bg-red-600 px-3.5 py-2 rounded-xl border border-red-500/30 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            /* =================================================================== */
            /* KONDISI B: HANYA MUNCUL DI PORTAL PENGUNJUNG / PENUMPANG            */
            /* =================================================================== */
            <>
              {/* DESKTOP NAV LINKS PENUMPANG */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {passengerLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Tombol Akses Cepat Jika Login sebagai Admin atau Petugas */}
                {currentUser?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Portal Admin</span>
                  </Link>
                )}

                {currentUser && ['PETUGAS', 'ADMIN'].includes(currentUser.role) && (
                  <Link
                    href="/petugas"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Portal Petugas</span>
                  </Link>
                )}
              </nav>

              {/* TOMBOL MASUK & DAFTAR (HANYA UNTUK PENUMPANG) */}
              <div className="hidden md:flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-3 bg-white/10 p-1.5 pl-3 rounded-full border border-white/10">
                    <span className="text-xs font-bold text-white">
                      {currentUser.nama.split(' ')[0]}
                    </span>
                    <button
                      onClick={handleLogout}
                      title="Keluar Akun"
                      className="w-7 h-7 rounded-full bg-red-500/30 hover:bg-red-500 text-red-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-xs font-bold text-white hover:text-blue-200 transition"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>

              {/* MOBILE HAMBURGER BUTTON */}
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* MOBILE DRAWER (HANYA PENUMPANG) */}
      {isMobileMenuOpen && !isSpecialPortal && (
        <div className="md:hidden bg-[#162b43] border-b border-blue-900 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {passengerLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex gap-2">
            <Link
              href="/login"
              className="flex-1 py-2.5 text-center text-xs font-bold bg-white/10 text-white rounded-xl"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="flex-1 py-2.5 text-center text-xs font-bold bg-blue-600 text-white rounded-xl"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};