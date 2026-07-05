import { useEffect, useState } from 'react';
import { getTelegramDisplayName, getTelegramId } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';
import { WatermarkOverlay } from './WatermarkOverlay';

const WATERMARK_WARNING: Record<string, string> = {
  uz: 'OGOHLANTIRISH: kontentni yozib olish taqiqlangan. Yana takrorlansa akkauntingiz bloklanadi.',
  ru: 'ПРЕДУПРЕЖДЕНИЕ: запись контента запрещена. При повторении аккаунт будет заблокирован.',
  en: 'WARNING: recording this content is forbidden. Repeated abuse will block your account.',
};

export function GlobalWatermark() {
  const { locale } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('dragstart', prevent);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('dragstart', prevent);
    };
  }, []);

  const telegramId = getTelegramId();
  const displayName = getTelegramDisplayName();
  const label = displayName ? `${displayName} | ID: ${telegramId}` : `ID: ${telegramId}`;
  const dateLabel = now.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale);
  const warning = WATERMARK_WARNING[locale] ?? WATERMARK_WARNING.uz;

  return <WatermarkOverlay label={label} dateLabel={dateLabel} warning={warning} fullScreen />;
}
