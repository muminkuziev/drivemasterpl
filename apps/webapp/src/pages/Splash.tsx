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
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
      <Logo size={112} />
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#f5f7fa' }}>
          DriveMaster <span style={{ color: '#f5a623' }}>AI</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9aa4bf' }}>
          {t('splash.tagline')}
        </p>
      </div>

      {needsLanguage ? (
        <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
          <p className="text-center text-sm mb-1" style={{ color: '#9aa4bf' }}>
            Tilni tanlang · Выберите язык · Choose your language
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => choose(lang.key)}
              className="rounded-2xl px-6 py-3.5 font-semibold"
              style={{
                background: locale === lang.key ? '#d4af37' : '#1a2338',
                color: locale === lang.key ? '#0b1220' : '#f5f7fa',
                border: '1px solid #2a3350',
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
            border: '3px solid #2a3350',
            borderTopColor: '#d4af37',
          }}
        />
      )}
    </div>
  );
}
