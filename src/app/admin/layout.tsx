'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    nama?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    // Periksa status login admin dari localStorage
    const savedUser =
      localStorage.getItem('railink_user') || localStorage.getItem('user');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const role = (parsed.role || '').toUpperCase();

        if (role === 'ADMIN' || parsed.email === 'admin@kai.id') {
          setCurrentUser(parsed);
        } else {
          router.replace('/login?redirect=' + encodeURIComponent(pathname));
        }
      } catch (err) {
        console.error('Gagal membaca sesi user:', err);
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      }
    } else {
      // Sesi fallback development agar admin langsung terbuka saat pengujian
      const demoAdmin = {
        id: 'admin-demo-1',
        nama: 'Administrator Railink',
        email: 'admin@kai.id',
        role: 'ADMIN',
      };
      localStorage.setItem('railink_user', JSON.stringify(demoAdmin));
      localStorage.setItem('user', JSON.stringify(demoAdmin));
      setCurrentUser(demoAdmin);
    }

    setCheckingAuth(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('railink_user');
    localStorage.removeItem('user');
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  const navItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Master Stasiun',
      href: '/admin/stasiun',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Master Kereta & Gerbong',
      href: '/admin/kereta',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v2m0 6v2m-6 4h12" />
        </svg>
      ),
    },
    {
      label: 'Master Rute & Jadwal',
      href: '/admin/jadwal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Kelola Tarif',
      href: '/admin/tarif',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Laporan Pemesanan',
      href: '/admin/laporan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigasi Admin */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              🚆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">Railink</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-slate-950">ADMIN</span>
              </div>
              <p className="text-xs text-slate-400">Portal Kelompok 14</p>
            </div>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Manajemen Operasional
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.nama || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@kai.id'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 py-1.5 text-center text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Ke Web Utama
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-lg transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 px-6 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">Server Status: Online (Supabase AWS eu-west-2)</span>
          </div>
          <div className="text-xs text-slate-400">
            Role Akses: <span className="font-semibold text-amber-400">ADMINISTRATOR</span>
          </div>
        </header>

        {/* children selalu di-render langsung di sini agar Turbopack tidak mendeteksi segment drop */}
        <main className="flex-1 p-6 overflow-y-auto">
          {checkingAuth && (
            <div className="mb-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Menyiapkan sesi administrator...</span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}