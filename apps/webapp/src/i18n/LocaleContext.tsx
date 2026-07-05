import { createContext, useContext, useState, type ReactNode } from 'react';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';
import { getLocale as getStoredLocale, setLocale as storeLocale, type Locale } from '../telegram';

export type { Locale };

type Dict = Record<string, unknown>;
const DICTS: Record<Locale, Dict> = { uz, ru, en };

function lookup(dict: Dict, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Dict)[part];
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
    text,
  );
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  function setLocale(next: Locale) {
    storeLocale(next);
    setLocaleState(next);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const text = lookup(DICTS[locale], key) ?? lookup(DICTS.uz, key) ?? key;
    return interpolate(text, vars);
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation LocaleProvider ichida ishlatilishi kerak');
  return ctx;
}

/**
 * Ko'p tilli kontent (savol/belgi matni) uchun: tanlangan tildagi tarjimani, u bo'lmasa
 * o'zbekchaga, u ham bo'lmasa polyakchaga qaytaradi. UI-matn uchun emas — bu faqat
 * bazadan kelgan (hali to'liq tarjima qilinmagan bo'lishi mumkin) kontent uchun.
 */
export function pickText(
  locale: Locale,
  fields: { pl?: string | null; uz?: string | null; ru?: string | null; en?: string | null },
): string {
  const byLocale = locale === 'uz' ? fields.uz : locale === 'ru' ? fields.ru : fields.en;
  return byLocale || fields.uz || fields.pl || '';
}
