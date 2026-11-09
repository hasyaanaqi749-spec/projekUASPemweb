// ========================================================================
// lib/logger.ts
// Structured Logging Server-Side menggunakan Pino
// Fitur: Redaction Data Sensitif, Pretty Print (Dev), JSON Output (Prod),
//        Domain-specific Helpers (Auth, Booking, Worker, Error)
// Projek UAS Pemrograman Web • Railink (Kelompok 14)
// ========================================================================

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Daftar kunci sensitif yang WAJIB disensor otomatis oleh Pino
const REDACT_PATHS = [
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'session_token',
  'authorization',
  'cookie',
  'cookies',
  'secret',
  'jwt',
  'keys_auth',
  'keys_p256dh',
  'penumpangIdentitas',
  'penumpang_identitas',
  'nik',
  'creditCard',
  '*.password',
  '*.token',
  '*.secret'
];

/**
 * Instance utama Pino Logger
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED_SENSITIVE]',
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    app: 'railink-kai-web',
    kelompok: 14,
  },
});

// ========================================================================
// DOMAIN-SPECIFIC STRUCTURED LOGGING HELPERS
// ========================================================================

/**
 * 1. Log Aktivitas Autentikasi Pengguna (Login, Logout, Register, dll)
 */
export function logAuthEvent(
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'REGISTER_SUCCESS' | 'LOGOUT' | 'UNAUTHORIZED_ACCESS',
  details: {
    userId?: string;
    email?: string;
    role?: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }
) {
  const logPayload = {
    category: 'AUTH_EVENT',
    action,
    userId: details.userId || 'anonymous',
    email: details.email,
    role: details.role,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent,
    reason: details.reason,
  };

  if (action === 'LOGIN_FAILED' || action === 'UNAUTHORIZED_ACCESS') {
    logger.warn(logPayload, `[AUTH] ${action} - Email: ${details.email || 'N/A'}`);
  } else {
    logger.info(logPayload, `[AUTH] ${action} - User: ${details.userId || details.email}`);
  }
}

/**
 * 2. Log Siklus Transaksi Pemesanan Tiket
 */
export function logBookingEvent(
  action: 'BOOKING_CREATED' | 'PAYMENT_CONFIRMED' | 'BOOKING_EXPIRED' | 'PASSENGER_BOARDED' | 'BOOKING_CANCELLED',
  details: {
    kodeBooking: string;
    userId?: string;
    totalBayar?: number;
    jumlahPenumpang?: number;
    kereta?: string;
    meta?: Record<string, any>;
  }
) {
  const logPayload = {
    category: 'BOOKING_LIFECYCLE',
    action,
    kodeBooking: details.kodeBooking,
    userId: details.userId,
    totalBayar: details.totalBayar,
    jumlahPenumpang: details.jumlahPenumpang,
    kereta: details.kereta,
    ...details.meta,
  };

  if (action === 'BOOKING_EXPIRED' || action === 'BOOKING_CANCELLED') {
    logger.warn(logPayload, `[TIKET] ${action} - Kode: ${details.kodeBooking}`);
  } else {
    logger.info(logPayload, `[TIKET] ${action} - Kode: ${details.kodeBooking}`);
  }
}

/**
 * 3. Log Eksekusi Background Worker (BullMQ / Cron Pembersihan Tiket Expired)
 */
export function logWorkerEvent(
  jobName: string,
  status: 'STARTED' | 'COMPLETED' | 'FAILED',
  details?: {
    durationMs?: number;
    processedCount?: number;
    error?: Error | unknown;
    meta?: Record<string, any>;
  }
) {
  const logPayload = {
    category: 'BACKGROUND_WORKER',
    jobName,
    status,
    durationMs: details?.durationMs,
    processedCount: details?.processedCount,
    errorMessage: details?.error instanceof Error ? details.error.message : String(details?.error || ''),
    errorStack: !isProduction && details?.error instanceof Error ? details.error.stack : undefined,
    ...details?.meta,
  };

  if (status === 'FAILED') {
    logger.error(logPayload, `[WORKER] Job "${jobName}" FAILED: ${logPayload.errorMessage}`);
  } else if (status === 'COMPLETED') {
    logger.info(logPayload, `[WORKER] Job "${jobName}" COMPLETED in ${details?.durationMs || 0}ms (Processed: ${details?.processedCount || 0})`);
  } else {
    logger.debug(logPayload, `[WORKER] Job "${jobName}" STARTED`);
  }
}

/**
 * 4. Log Kesalahan Global / Exception Handler
 */
export function logSystemError(
  error: Error | unknown,
  context: string,
  additionalData?: Record<string, any>
) {
  const isErrInstance = error instanceof Error;

  logger.error(
    {
      category: 'SYSTEM_ERROR',
      context,
      name: isErrInstance ? error.name : 'UnknownError',
      message: isErrInstance ? error.message : String(error),
      stack: isProduction ? undefined : isErrInstance ? error.stack : undefined,
      ...additionalData,
    },
    `[ERROR] ${context}: ${isErrInstance ? error.message : String(error)}`
  );
}

export default logger;