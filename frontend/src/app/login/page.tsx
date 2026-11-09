"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    const role = email.toLowerCase().includes("admin")
      ? "ADMIN"
      : email.toLowerCase().includes("petugas")
        ? "PETUGAS"
        : "PENUMPANG";

    const user = {
      id: "demo-user",
      name: email.split("@")[0],
      email,
      role,
    };

    localStorage.setItem("railink-user", JSON.stringify(user));

    if (role === "ADMIN") router.push("/admin");
    else if (role === "PETUGAS") router.push("/petugas");
    else router.push("/dashboard");
  }

  return (
    <main className="hero-pattern flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link href="/" className="text-2xl font-black text-[#10243b]">
          Rail<span className="text-orange-500">ink.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-black">Selamat Datang</h1>
        <p className="mt-2 text-sm muted">
          Masuk ke akun Railink untuk melanjutkan.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold">Email</label>
            <input
              className="field"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Password</label>
            <input
              className="field"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn w-full" type="submit">
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-sm muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-blue-700">
            Daftar sekarang
          </Link>
        </p>

        <Link href="/" className="mt-5 block text-center text-sm text-gray-500">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}