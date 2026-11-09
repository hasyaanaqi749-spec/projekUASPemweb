# 🚆 Railink - Sistem Informasi & Pemesanan Tiket Kereta Api

> **Projek Akhir Pemrograman Web (UAS)** • **Kelompok 14**  
> Dibuat dengan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL (Supabase)**, **BullMQ + Redis**, dan **Web Push Notifications (VAPID)**.

---

## 👥 Tim Pengembang (Kelompok 14)

| Peran | Anggota | Tanggung Jawab Utama |
| :--- | :--- | :--- |
| **Anggota A** | *Backend & Database Lead* | Perancangan Database Relasional (8 Tabel PostgreSQL), Skema Prisma, Seed Data KAI, Konfigurasi Connection Pooler Supabase. |
| **Anggota B** | *Frontend Passenger Lead* | Portal Penumpang, Form Pencarian Tiket, Peta Denah Kursi Interaktif (SeatMap 2-2), Validasi Penumpang (Zod), E-Ticket Boarding Pass (Cetak PDF). |
| **Anggota C** | *Operations, Quality & Worker Lead* | Portal Admin (Master Stasiun, Kereta, Jadwal & Tarif), Portal Petugas (Scan QR & Boarding Gate), Structured Logging (Pino), Background Worker Expired (BullMQ + Redis), & Error Boundary. |

---

## 🛠️ Tech Stack & Arsitektur Sistem

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons
- **Database**: [PostgreSQL 15+](https://www.postgresql.org/) via [Supabase Database](https://supabase.com/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Background Worker & Queue**: [BullMQ](https://docs.bullmq.io/) + [Redis / Upstash Redis](https://upstash.com/)
- **Autentikasi & Otorisasi**: Role-Based Access Control (RBAC) via HTTP-Only Session Cookie + Jose JWT (`PENUMPANG`, `PETUGAS`, `ADMIN`)
- **Structured Logger**: [Pino](https://github.com/pinojs/pino) + `pino-pretty` (Sensitive Data Redaction)
- **Web Push**: Web Push API (RFC 8291 / VAPID Keys) + Service Worker

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js** versi `18.18.0` atau `20.x+`
- **npm** atau **pnpm**
- Akun **Supabase** (Database PostgreSQL)
- **Redis Server** (Bisa menggunakan Docker lokal atau cloud gratis di [Upstash Redis](https://upstash.com/))

### 2. Clone & Install Dependencies
```bash
# Masuk ke direktori projek
cd lajurel-web

# Install seluruh dependency
npm install