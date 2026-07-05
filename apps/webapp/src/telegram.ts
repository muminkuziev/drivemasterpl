interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  initDataUnsafe?: {
    user?: { id: number; first_name?: string; username?: string };
  };
  openTelegramLink?: (url: string) => void;
  initData?: string;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return typeof window !== 'undefined' && window.Telegram ? window.Telegram.WebApp : null;
}

export function initTelegramWebApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor('#0b1220');
  webApp.setBackgroundColor('#0b1220');
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
}

/** Telegram username (masalan "founder_mk") ga chat ochadi — WebApp ichida bo'lsa native, aks holda yangi tab. */
export function openTelegramUser(username: string) {
  const url = `https://t.me/${username}`;
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
}

/** Telegram foydalanuvchi ID'si. WebApp tashqarisida (brauzerda test qilishda)
 * localStorage'da saqlangan test ID'ga tushadi, shunda testlar shu holatda ham ishlaydi. */
export function getTelegramId(): string {
  const fromTelegram = getTelegramWebApp()?.initDataUnsafe?.user?.id;
  if (fromTelegram) return String(fromTelegram);
  const key = 'dm_dev_telegram_id';
  let devId = localStorage.getItem(key);
  if (!devId) {
    devId = `dev-${Math.floor(Math.random() * 1_000_000)}`;
    localStorage.setItem(key, devId);
  }
  return devId;
}

/** Telegram profilidagi ism/username (faqat ko'rsatish uchun). WebApp tashqarisida
 * (Telegram foydalanuvchisi bo'lmaganda) `null` qaytaradi — chaqiruvchi mos "mehmon" matnini
 * o'zi tanlangan tilda ko'rsatishi kerak. */
export function getTelegramDisplayName(): string | null {
  const user = getTelegramWebApp()?.initDataUnsafe?.user;
  if (user?.first_name) return user.first_name;
  if (user?.username) return `@${user.username}`;
  return null;
}

// ---------- Til (locale) ----------

export type Locale = 'uz' | 'ru' | 'en';
const LOCALE_KEY = 'dm_locale';

export function hasStoredLocale(): boolean {
  return localStorage.getItem(LOCALE_KEY) !== null;
}

export function getLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored === 'uz' || stored === 'ru' || stored === 'en') return stored;
  return 'uz';
}

export function setLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

/** Bot ichida til allaqachon tanlangan bo'lsa (masalan /start'da), WebApp
 * tugmasi `?lang=uz|ru|en` bilan ochiladi — shu tilni localStorage'ga yozib
 * qo'yamiz, shunda Splash ekrani tilni qayta so'ramaydi. */
export function applyLocaleFromUrl() {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang === 'uz' || lang === 'ru' || lang === 'en') {
    setLocale(lang);
  }
}

/** Telegram tomonidan imzolangan xom initData satri — backend buni bot tokeni bilan
 * tekshirib, telegramId'ni soxtalashtirib bo'lmasligini ta'minlaydi. WebApp tashqarisida bo'sh qaytadi. */
export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? '';
}

export function getDeviceId(): string {
  const key = 'dm_device_id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}
