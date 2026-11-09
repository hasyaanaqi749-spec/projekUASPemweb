// ========================================================================
// app/login/page.tsx
// Halaman Login Akun Railink (Pilihan Admin, Petugas, dan Penumpang)
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Train, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Scan, 
  User, 
  Sparkles,
  Info
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Info ramah (bukan error) jika diarahkan dari halaman khusus
  const isFromAdmin = redirectParam.startsWith('/admin');
  const isFromPetugas = redirectParam.startsWith('/petugas');

  // Fungsi pengisian cepat akun demo (1-Klik)
  const handleQuickFill = (role: 'ADMIN' | 'PETUGAS' | 'PENUMPANG') => {
    setErrorMsg('');
    setSuccessMsg('');
    if (role === 'ADMIN') {
      setEmail('admin@kai.id');
      setPassword('admin123');
    } else if (role === 'PETUGAS') {
      setEmail('petugas.gmr@kai.id');
      setPassword('petugas123');
    } else {
      setEmail('budi@gmail.com');
      setPassword('budi123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Alamat email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Email atau kata sandi tidak valid.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`Berhasil masuk sebagai ${data.user.nama} (${data.user.role}). Mengalihkan...`);

      // Simpan ke SEMUA variasi storage key agar cocok dengan semua layout guard
      try {
        const userObjStr = JSON.stringify(data.user);
        localStorage.setItem('railink_user', userObjStr);
        localStorage.setItem('user', userObjStr);
        sessionStorage.setItem('railink_user', userObjStr);
        sessionStorage.setItem('user', userObjStr);
      } catch (e) {}

      // Tentukan rute tujuan yang benar berdasarkan Role pengguna
      let destination = '/';
      const userRole = data.user.role;

      if (userRole === 'ADMIN') {
        destination = redirectParam.startsWith('/admin') ? redirectParam : '/admin';
      } else if (userRole === 'PETUGAS') {
        destination = redirectParam.startsWith('/petugas') ? redirectParam : '/petugas';
      } else {
        if (redirectParam.startsWith('/admin') || redirectParam.startsWith('/petugas')) {
          destination = '/';
        } else {
          destination = redirectParam || '/';
        }
      }

      // Gunakan window.location.href untuk penyegaran sesi penuh
      setTimeout(() => {
        window.location.href = destination;
      }, 250);

    } catch (err: any) {
      setErrorMsg('Terjadi kendala jaringan saat menghubungi server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Train className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
            Railink<span className="text-amber-500">.</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
          Sistem Informasi Kereta Api • Kelompok 14
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Selamat Datang</h2>
            <p className="text-xs text-slate-400">
              Masuk ke portal akun Railink untuk mengelola atau memesan tiket.
            </p>
          </div>

          {/* Banner Informasi Ramah (Warna Biru, bukan error merah) */}
          {(isFromAdmin || isFromPetugas) && !errorMsg && (
            <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                {isFromAdmin 
                  ? 'Silakan masuk dengan akun Admin untuk mengelola portal dashboard.' 
                  : 'Silakan masuk dengan akun Petugas untuk mengakses gate validasi.'}
              </span>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tombol Submit Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun Railink</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pintasan Akun Cepat untuk Uji Coba */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Pintasan Akun Uji Coba (Klik Langsung Isi):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl text-center transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block">admin@kai.id</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('PETUGAS')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-center transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-0.5">
                  <Scan className="w-3.5 h-3.5" />
                  <span>Petugas</span>
                </div>
                <span className="text-[10px] text-slate-500 block">petugas.gmr</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('PENUMPANG')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-xl text-center transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold mb-0.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Penumpang</span>
                </div>
                <span className="text-[10px] text-slate-500 block">budi@gmail</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-1">
            <Link href="/" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
              &larr; <span>Kembali ke Beranda Utama</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Memuat form login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}