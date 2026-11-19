import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../splash.css';
import { hasStoredLocale, haptic } from '../telegram';
import { useTranslation, type Locale } from '../i18n/LocaleContext';

type FlagName = 'uz' | 'ru' | 'en' | 'pl' | 'ua';

/** Tanlanadigan tillar (faqat mavjud 3 ta til) */
const LANGUAGES: { key: Locale; flag: FlagName; label: string; native: string }[] = [
  { key: 'pl', flag: 'pl', label: 'Polski', native: 'Język polski' },
  { key: 'en', flag: 'en', label: 'English', native: 'English language' },
  { key: 'uz', flag: 'uz', label: "O'zbekcha", native: "O'zbek tili" },
  { key: 'uk', flag: 'ua', label: 'Українська', native: 'Українська мова' },
  { key: 'ru', flag: 'ru', label: 'Русский', native: 'Русский язык' },
];

function Flag({ name }: { name: FlagName }) {
  const id = `dms-fc-${name}`;
  return (
    <svg className="dms-flag" viewBox="0 0 44 44" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx="22" cy="22" r="22" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {name === 'uz' && (
          <>
            <rect width="44" height="15" fill="#1eb4e8" />
            <rect y="15" width="44" height="14" fill="#fff" />
            <rect y="29" width="44" height="15" fill="#1eb53a" />
            <rect y="14" width="44" height="1.6" fill="#ce1126" />
            <rect y="28.4" width="44" height="1.6" fill="#ce1126" />
            <circle cx="10" cy="7.5" r="4" fill="#fff" />
            <circle cx="11.6" cy="7.5" r="3.4" fill="#1eb4e8" />
          </>
        )}
        {name === 'ru' && (
          <>
            <rect width="44" height="15" fill="#fff" />
            <rect y="15" width="44" height="14" fill="#1c57c9" />
            <rect y="29" width="44" height="15" fill="#e4382b" />
          </>
        )}
        {name === 'pl' && (
          <>
            <rect width="44" height="22" fill="#fff" />
            <rect y="22" width="44" height="22" fill="#e4262f" />
          </>
        )}
        {name === 'ua' && (
          <>
            <rect width="44" height="22" fill="#1f5fd0" />
            <rect y="22" width="44" height="22" fill="#ffd200" />
          </>
        )}
        {name === 'en' && (
          <>
            <rect width="44" height="44" fill="#1b3a8c" />
            <path d="M0 0 44 44M44 0 0 44" stroke="#fff" strokeWidth="8" />
            <path d="M0 0 44 44M44 0 0 44" stroke="#d6213a" strokeWidth="3" />
            <path d="M22 0v44M0 22h44" stroke="#fff" strokeWidth="13" />
            <path d="M22 0v44M0 22h44" stroke="#d6213a" strokeWidth="7" />
          </>
        )}
      </g>
    </svg>
  );
}

function Check() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7fe8ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

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
    <div className="dms dm-enter">
      <div className="dms-hero">
        <span className="dms-logo" aria-hidden="true">DM</span>
        <h1 className="dms-title">
          DriveMaster <span>AI</span>
        </h1>
        <p className="dms-tagline">
          <i />
          {t('splash.tagline')}
          <i />
        </p>
      </div>

      {needsLanguage ? (
        <section className="dms-panel" aria-label="Language">
          <div className="dms-panel-head">
            <span className="dms-globe" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9fe3ff" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9.5" />
                <path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19M4.5 7h15M4.5 17h15" />
              </svg>
            </span>
            <span>
              <span className="dms-panel-title">Tilni tanlang · Выберите язык</span>
              <span className="dms-panel-sub">Choose your language · Wybierz język · Оберіть мову</span>
            </span>
          </div>
          {LANGUAGES.map((lang) => {
            const active = locale === lang.key;
            return (
              <button
                key={lang.key}
                type="button"
                onClick={() => choose(lang.key)}
                className={`dms-row dm-press${active ? ' is-active' : ''}`}
              >
                <Flag name={lang.flag} />
                <span className="dms-row-text">
                  <span className="dms-row-title">{lang.label}</span>
                  <span className="dms-row-sub">{lang.native}</span>
                </span>
                {active && <Check />}
              </button>
            );
          })}
        </section>
      ) : (
        <div className="dms-spin" role="status" aria-label="Loading" />
      )}
    </div>
  );
}
