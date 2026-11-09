// src/hooks/useWebPush.ts
// ========================================================================
// SISTEM INFORMASI KERETA API (KELOMPOK 14)
// Custom Hook Web Push Notification (VAPID Subscription & Permission)
// ========================================================================

'use client';

import { useState, useEffect } from 'react';

// Helper: Konversi URL-Safe Base64 VAPID Key ke Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface UseWebPushReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
  errorMessage: string | null;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  sendTestPush: () => Promise<void>;
}

export function useWebPush(): UseWebPushReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // VAPID Public Key dari .env (Fallback ke kunci default Anda)
  const VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BMB8955_z8lP-wi1wvXirbh8vfaq46nXy_-HsC3CaWw3Hm-cQi1RngFohZcui29RR8rt2pwhlNDJ1MbrMrKMhr4';

  // 1. Periksa dukungan browser saat komponen dimuat
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Cek apakah sudah pernah subscribe sebelumnya
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((sub) => {
          setIsSubscribed(Boolean(sub));
        })
        .catch(() => {
          setIsSubscribed(false);
        });
    } else {
      setIsSupported(false);
    }
  }, []);

  // 2. Fungsi Mendaftarkan Push Subscription
  const subscribeToPush = async (): Promise<boolean> => {
    if (!isSupported) {
      setErrorMessage('Browser ini tidak mendukung Web Push Notification.');
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // A. Minta Izin Notifikasi ke Pengguna
      const userPermission = await Notification.requestPermission();
      setPermission(userPermission);

      if (userPermission !== 'granted') {
        setErrorMessage('Izin notifikasi ditolak oleh pengguna.');
        setIsLoading(false);
        return false;
      }

      // B. Daftarkan Service Worker public/sw.js
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // C. Lakukan Push Subscription dengan VAPID Public Key
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });

      // D. Kirim subscription payload ke Backend API Supabase
      const subJson = subscription.toJSON();
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan subscription ke database server.');
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('[PUSH ERROR]:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.');
      setIsLoading(false);
      return false;
    }
  };

  // 3. Fungsi Berhenti Berlangganan Notifikasi
  const unsubscribeFromPush = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setErrorMessage('Gagal mematikan notifikasi.');
      setIsLoading(false);
      return false;
    }
  };

  // 4. Fungsi Kirim Uji Coba Notifikasi (Simulasi Langsung)
  const sendTestPush = async () => {
    try {
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Tiket KAI - Pengingat Jadwal', {
          body: 'Kereta Taksaka Malam Anda akan berangkat 60 menit lagi dari Stasiun Gambir.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: { url: '/tiket/riwayat' },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    errorMessage,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestPush,
  };
}