"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    const user = {
      id: "demo-user",
      name,
      email,
      role: "PENUMPANG",
    };

    localStorage.setItem("railink-user", JSON.stringify(user));
    router.push("/dashboard");
  }

  return (
    <main className="hero-pattern flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link href="/" className="text-2xl font-black text-[#10243b]">
          Rail<span className="text-orange-500">ink.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-black">Buat Akun</h1>
        <p className="mt-2 text-sm muted">
          Daftar untuk mulai memesan tiket kereta.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold">Nama Lengkap</label>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Email</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          {message && <p className="text-sm text-red-600">{message}</p>}

          <button type="submit" className="btn w-full">
            Daftar
          </button>
        </form>

        <p className="mt-6 text-center text-sm muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-blue-700">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}