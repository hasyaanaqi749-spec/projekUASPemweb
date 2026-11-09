// src/components/PushNotificationButton.tsx
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Komponen UI Tombol "Aktifkan Notifikasi Tiket" (Web Push Notification)
// ========================================================================

'use client';

import React, { useState } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { 
  BellRing, 
  BellOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send 
} from 'lucide-react';

export const PushNotificationButton: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    errorMessage,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestPush,
  } = useWebPush();

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleToggleNotification = async () => {
    if (isSubscribed) {
      const ok = await unsubscribeFromPush();
      if (ok) {
        setSuccessToast('Notifikasi perjalanan berhasil dinonaktifkan.');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } else {
      const ok = await subscribeToPush();
      if (ok) {
        setSuccessToast('Berhasil! Anda akan menerima update jadwal dan boarding real-time.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Browser Anda saat ini belum mendukung fitur Web Push Notification.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Info Text */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isSubscribed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}>
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Notifikasi Perjalanan &amp; Tiket Kereta
              </h3>
              {isSubscribed ? (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Aktif
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Belum Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dapatkan peringatan batas waktu pembayaran, perubahan peron stasiun, dan status boarding gate secara langsung di layar perangkat Anda.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isLoading || permission === 'denied'}
            onClick={handleToggleNotification}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
              isSubscribed
                ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : isSubscribed ? (
              <>
                <BellOff className="w-3.5 h-3.5" />
                <span>Matikan Notifikasi</span>
              </>
            ) : (
              <>
                <BellRing className="w-3.5 h-3.5" />
                <span>Aktifkan Notifikasi Tiket</span>
              </>
            )}
          </button>

          {/* Tombol Tes Kirim Notifikasi */}
          {isSubscribed && (
            <button
              type="button"
              onClick={sendTestPush}
              title="Kirim notifikasi simulasi ke layar ini"
              className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tes Notif</span>
            </button>
          )}
        </div>

      </div>

      {/* Pesan Sukses Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Pesan Error Jika Izin Ditolak */}
      {permission === 'denied' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            Izin notifikasi diblokir di setelan browser Anda. Klik ikon gembok di sebelah URL browser untuk mengizinkan notifikasi.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};