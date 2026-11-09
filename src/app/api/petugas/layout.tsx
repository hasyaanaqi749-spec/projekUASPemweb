// src/app/petugas/layout.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Dashboard Layout Khusus Petugas Boarding & Client-Side Role Guard
// ========================================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Train, 
  QrCode, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [petugasUser, setPetugasUser] = useState<{ nama: string; email: string } | null>(null);

  // 1. CLIENT-SIDE ROLE GUARD: Verifikasi Hak Akses Role PETUGAS atau ADMIN
  useEffect(() => {
    const verifyPetugasRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && ['PETUGAS', 'ADMIN'].includes(data.user.role)) {
            setIsAuthorized(true);
            setPetugasUser(data.user);
            return;
          }
        }
      } catch (e) {
        // Abaikan
      }

      setIsAuthorized(false);
      router.push('/login?redirect=/petugas');
    };

    verifyPetugasRole();
  }, [router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { label: 'Validasi Tiket & Boarding', href: '/petugas', icon: QrCode },
    { label: 'Daftar Penumpang Hari Ini', href: '/petugas#penumpang', icon: Users },
  ];

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#1c3654] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-bold tracking-wider uppercase">
          Memverifikasi Petugas Stasiun...
        </p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* 1. SIDEBAR PETUGAS (DESKTOP) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#162b43] text-white shrink-0 border-r border-blue-950 min-h-screen p-6 justify-between">
        <div className="space-y-8">
          
          <Link href="/petugas" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md font-black">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rail<span className="text-orange-500">ink</span>.
              </span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Gate Boarding Petugas
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block px-3 mb-2">
              Menu Operasional Peron
            </span>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil Petugas di Bawah */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs">
              PT
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {petugasUser?.nama || 'Petugas Stasiun Gambir'}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold truncate">
                Gate Stasiun Aktif
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition text-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white text-[11px] font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER PETUGAS */}
      <div className="lg:hidden bg-[#162b43] text-white p-4 flex items-center justify-between border-b border-blue-950">
        <Link href="/petugas" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-black text-lg">Railink Petugas Gate</span>
        </Link>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-white/10 text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="lg:hidden bg-[#132337] text-white p-6 border-b border-blue-900 space-y-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-300 font-bold text-xs rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun Petugas</span>
          </button>
        </div>
      )}

      {/* 3. KONTEN UTAMA VALIDASI PETUGAS */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}