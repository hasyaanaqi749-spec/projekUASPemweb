'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, setSessionCookie, removeSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

/**
 * ACTION: REGISTER PENUMPANG BARU
 */
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const nama = formData.get('nama') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;

  // 1. Validasi Input Dasar
  if (!nama || nama.trim().length < 3) {
    return { success: false, error: 'Nama lengkap minimal 3 karakter.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Format email tidak valid.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }
  if (!phone || phone.length < 10) {
    return { success: false, error: 'Nomor telepon minimal 10 digit.' };
  }

  try {
    // 2. Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung login.' };
    }

    // 3. Hash Password dengan Bcrypt
    const passwordHash = await hashPassword(password);

    // 4. Buat user baru (Default registrasi publik selalu 'PENUMPANG')
    const user = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone.trim(),
        role: 'PENUMPANG',
      },
    });

    // 5. Langsung pasang HTTP-Only cookie sesi
    await setSessionCookie({
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
    });

  } catch (error) {
    console.error('[REGISTER ERROR]:', error);
    // Pesan error aman (tidak membocorkan error teknis database)
    return { success: false, error: 'Terjadi kesalahan sistem saat mendaftar. Silakan coba lagi.' };
  }

  redirect('/');
}

/**
 * ACTION: LOGIN (PENUMPANG, PETUGAS, ADMIN)
 */
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' };
  }

  let userRole: string = 'PENUMPANG';

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // PRINSIP KEAMANAN: Pesan generik sama persis jika email tidak ada atau password salah!
    // Mencegah hacker menebak apakah email terdaftar atau tidak (User Enumeration Attack)
    if (!user) {
      return { success: false, error: 'Email atau password yang Anda masukkan salah.' };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Email atau password yang Anda masukkan salah.' };
    }

    userRole = user.role;

    // Pasang cookie session
    await setSessionCookie({
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
    });

  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    return { success: false, error: 'Gagal memproses login. Silakan coba beberapa saat lagi.' };
  }

  // Redirect dinamis sesuai Role
  if (userRole === 'ADMIN') {
    redirect('/admin');
  } else if (userRole === 'PETUGAS') {
    redirect('/petugas');
  } else {
    redirect('/');
  }
}

/**
 * ACTION: LOGOUT
 */
export async function logoutAction() {
  await removeSessionCookie();
  redirect('/login');
}