import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../home.css';
import { BottomNav } from '../components/BottomNav';
import { HeroArt } from '../components/HeroArt';
import { QuickGlyph } from '../components/QuickIcons';
import { Icon, type IconName } from '../components/Icons';
import { useTranslation, type Locale } from '../i18n/LocaleContext';

const LANGS: { code: Locale; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbekcha" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'uk', flag: '🇺🇦', label: 'Українська' },
];

/** 4 ta tezkor yorliq: gradientli "ilova ikonkasi" uslubida */
const QUICK = [
  { key: 'tests', to: '/theory', bg: 'linear-gradient(145deg,#4f8dff,#1747c9)' },
  { key: 'signs', to: '/signs', bg: 'linear-gradient(145deg,#ff9ccc,#ff4d9d)' },
  { key: 'lessons', to: '/theory/text', bg: 'linear-gradient(145deg,#46dd8f,#12a850)' },
  { key: 'videos', to: '/theory/video', bg: 'linear-gradient(145deg,#ffd84d,#ffa90a)' },
] as const;

function Trophy() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M10 5h14v8a7 7 0 0 1-14 0V5Z" fill="#ffc933" />
      <path d="M10 8H5.5c0 4 1.7 6.2 5 6.6M24 8h4.5c0 4-1.7 6.2-5 6.6" stroke="#f0a30a" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 20v4.5M11.5 29h11l-1.2-4.5h-8.6L11.5 29Z" fill="#f0a30a" stroke="#f0a30a" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.5 7.5v5.5" stroke="#fff3c2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const MORE: { icon: IconName; accent: string; key: string; to: string }[] = [
  { icon: 'map', accent: '13,170,150', key: 'roadmap', to: '/roadmap' },
  { icon: 'pin', accent: '230,150,10', key: 'wordCenters', to: '/word-centers' },
  { icon: 'car', accent: '22,163,74', key: 'driver', to: '/driver' },
  { icon: 'alert', accent: '234,106,20', key: 'violations', to: '/violations' },
];
// AI Tarjimon: OPENAI_API_KEY sozlanmaganligi sababli vaqtincha yashirilgan.
// Kalit qo'shilgach MORE'ga qaytarish kifoya:
// { icon: 'mic', accent: '13,170,150', key: 'translator', to: '/translator' },

export function MainMenu() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  return (
    <div className="dmh dm-enter">
      <section className="dmh-hero">
        <HeroArt />
        <div className="dmh-top">
          <div className="dmh-brand">
            <span className="dmh-mark">DM</span>
            <span>
              DriveMaster AI
              <span className="dmh-tag">POLAND · DRIVING ACADEMY</span>
            </span>
          </div>
          <div className="dmh-lang">
            <button type="button" className="dmh-lang-btn" onClick={() => setLangOpen((o) => !o)} aria-expanded={langOpen}>
              <span aria-hidden="true">{current.flag}</span>
              {current.code.toUpperCase()}
              <Icon name="chevron" size={14} strokeWidth={2.4} style={{ transform: 'rotate(90deg)' }} />
            </button>
            {langOpen && (
              <div className="dmh-lang-menu" role="menu">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="menuitem"
                    className={`dmh-lang-opt${l.code === locale ? ' is-active' : ''}`}
                    onClick={() => {
                      setLocale(l.code);
                      setLangOpen(false);
                    }}
                  >
                    <span aria-hidden="true">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="dmh-bell" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
            <i />
          </span>
        </div>
        <h1 className="dmh-greet">
          {t('home.hello')}
          <span className="dmh-wave" aria-hidden="true"> 👋</span>
          <span className="dmh-greet-accent">{t('home.welcome')}</span>
        </h1>
        <span className="dmh-rule" aria-hidden="true" />
        <p className="dmh-sub">{t('home.subtitle')}</p>
      </section>

      <section className="dmh-quick" aria-label={t('home.shortcuts')}>
        {QUICK.map((q) => (
          <button key={q.key} type="button" className="dmh-quick-item dm-press" onClick={() => navigate(q.to)}>
            <span className="dmh-tile-icon" style={{ background: q.bg }}>
              <QuickGlyph name={q.key} />
            </span>
            {t(`home.quick.${q.key}`)}
          </button>
        ))}
      </section>

      <button type="button" className="dmh-feature dm-press" onClick={() => navigate('/psych')}>
        <span className="dmh-feature-ico">
          <Icon name="brain" size={34} strokeWidth={1.8} />
        </span>
        <span className="dmh-feature-body">
          <span className="dmh-feature-title">{t('mainMenu.item.psych.title')}</span>
          <span className="dmh-feature-sub" style={{ display: 'block' }}>
            {t('mainMenu.item.psych.subtitle')}
          </span>
        </span>
        <Icon name="chevron" size={22} strokeWidth={2.2} />
      </button>

      <section className="dmh-exam">
        <span className="dmh-exam-icon">
          <Trophy />
        </span>
        <span className="dmh-exam-body">
          <span className="dmh-exam-title" style={{ display: 'block' }}>{t('home.exam.title')}</span>
          <span className="dmh-exam-sub" style={{ display: 'block' }}>{t('home.exam.text')}</span>
        </span>
        <button type="button" className="dmh-btn dm-press" onClick={() => navigate('/theory')}>
          {t('home.exam.cta')}
          <Icon name="chevron" size={16} strokeWidth={2.6} />
        </button>
      </section>

      <section className="dmh-more">
        <h2 className="dmh-more-title">{t('home.more')}</h2>
        <div className="dmh-more-list">
          {MORE.map((m) => (
            <button
              key={m.to}
              type="button"
              className="dmh-more-row dm-press"
              style={{ ['--accent-rgb' as string]: m.accent }}
              onClick={() => navigate(m.to)}
            >
              <span className="dmh-more-ico">
                <Icon name={m.icon} size={22} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="dmh-more-name">{t(`mainMenu.item.${m.key}.title`)}</span>
                <span className="dmh-more-desc">{t(`mainMenu.item.${m.key}.subtitle`)}</span>
              </span>
              <Icon name="chevron" size={18} style={{ color: '#8aa0cc' }} />
            </button>
          ))}
        </div>
      </section>

      <div className="dmh-spacer" />
      <BottomNav />
    </div>
  );
}
