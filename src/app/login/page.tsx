'use client';

import { Suspense, useState } from 'react';
import { loginAction } from '@/app/actions/authActions';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res: any = await loginAction(formData);

      if (!res.success) {
        setError(res.error || 'Email atau password salah');
        setLoading(false);
        return;
      }

      // Deteksi role
      const role = String(res.role || res.user?.role || '').toUpperCase();

      // Gunakan window.location.href agar cookie baru terbaca bersih 100%
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'PETUGAS') {
        window.location.href = '/petugas';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 text-white font-black text-2xl shadow-lg shadow-orange-600/30 mb-3">
          🚆
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">LajuRel Portal</h1>
        <p className="text-sm text-slate-400 mt-1">Sistem Pemesanan Tiket & RBAC</p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Alamat Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Kata Sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/25 transition-all active:scale-95 disabled:opacity-50 text-sm mt-2"
        >
          {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
        </button>
      </form>

      {/* 3 Tombol Demo Khusus Dosen / Uji Coba */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <p className="text-xs font-medium text-slate-400 text-center mb-3">
          Pintasan Akun Uji Coba (Klik langsung isi):
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@lajurel.com', 'admin123')}
            className="px-2 py-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400 font-semibold border border-amber-500/20 text-center transition-colors"
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('petugas@lajurel.com', 'petugas123')}
            className="px-2 py-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-400 font-semibold border border-blue-500/20 text-center transition-colors"
          >
            👮 Petugas
          </button>
          <button
            type="button"
            onClick={() => fillDemo('budi@example.com', 'user123')}
            className="px-2 py-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-semibold border border-emerald-500/20 text-center transition-colors"
          >
            🎫 Penumpang
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}