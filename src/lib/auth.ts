import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kunci_rahasia_super_aman_kai_2026_default'
);

const COOKIE_NAME = 'session_token';

export interface UserSession {
  id: string;
  email: string;
  nama: string;
  role: UserRole; // 'PENUMPANG' | 'PETUGAS' | 'ADMIN'
}

// 1. PASSWORD HASHING
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

// 2. JWT & HTTP-ONLY COOKIE MANAGEMENT
export async function createSessionToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Berlaku 7 hari
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserSession): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Anti XSS: JavaScript browser tidak bisa membaca cookie ini
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Proteksi serangan CSRF
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// 3. SERVER-SIDE AUTHORIZATION GUARDS
export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Wajib Login: Cek pengguna terautentikasi
 */
export async function requireAuth(): Promise<UserSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Role Guard: Memeriksa apakah role pengguna ada dalam daftar role yang diizinkan
 * Contoh pemanggilan: await requireRole(['ADMIN'])
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserSession> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}