import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { hasStoredLocale, haptic } from '../telegram';
import { useTranslation, type Locale } from '../i18n/LocaleContext';

const LANGUAGES: { key: Locale; label: string }[] = [
  { key: 'uz', label: "O'zbekcha" },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
];

export function Splash() {
  const navigate = useNavigate();
  const { locale, setLocale, t } = useTranslation();
  const [needsLanguage, setNeedsLanguage] = useState(() => !hasStoredLocale());

  useEffect(() => {
    if (needsLanguage) return;
    const timer = setTimeout(() => navigate('/menu', { replace: true }), 1400);
    return () => clearTimeout(timer);
  }, [needsLanguage, navigate]);

  function choose(key: Locale) {
    haptic('light');
    setLocale(key);
    setNeedsLanguage(false);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 dm-enter">
      <Logo size={112} />
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--dm-text)' }}>
          DriveMaster <span style={{ color: 'var(--dm-orange)' }}>AI</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--dm-text-muted)' }}>
          {t('splash.tagline')}
        </p>
      </div>

      {needsLanguage ? (
        <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
          <p className="text-center text-sm mb-1" style={{ color: 'var(--dm-text-muted)' }}>
            Tilni tanlang · Выберите язык · Choose your language
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => choose(lang.key)}
              className="dm-press rounded-2xl px-6 py-3.5 font-semibold"
              style={{
                background: locale === lang.key ? 'var(--dm-gold)' : 'var(--dm-card)',
                color: locale === lang.key ? 'var(--dm-bg)' : 'var(--dm-text)',
                border: '1px solid var(--dm-border)',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-full animate-spin mt-4"
          style={{
            border: '3px solid var(--dm-border)',
            borderTopColor: 'var(--dm-gold)',
          }}
        />
      )}
    </div>
  );
}
