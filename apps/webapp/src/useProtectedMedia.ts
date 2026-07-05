import { useEffect, useState } from 'react';
import { authHeaders } from './api';
import { getDeviceId, getTelegramId } from './telegram';

/**
 * Himoyalangan media URL'ni (masalan /api/media/theory/:id) haqiqiy
 * X-Telegram-Init-Data headeri bilan yuklab, blob: URL sifatida qaytaradi.
 * <video>/<img> tegi headerlarni o'zi yubora olmaydi, shuning uchun media
 * shu hook orqali avtorizatsiyalangan fetch bilan olinadi.
 */
export function useProtectedMedia(url: string | null): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;

    const q = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${q}telegramId=${encodeURIComponent(getTelegramId())}&deviceId=${encodeURIComponent(getDeviceId())}`;

    fetch(fullUrl, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error(`Media xatosi: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return blobUrl;
}
