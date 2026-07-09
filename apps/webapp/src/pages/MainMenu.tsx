import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useTranslation } from '../i18n/LocaleContext';

interface MenuItem {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  to: string;
  disabled?: boolean;
}

// AI Tarjimon: OPENAI_API_KEY hali sozlanmaganligi sababli asosiy menyudan
// vaqtincha yashirilgan. Kalit qo'shilgach, quyidagi qatorni qaytarish kifoya
// — sahifa (/translator) va backend allaqachon tayyor.
// { icon: '🗣', titleKey: 'mainMenu.item.translator.title', subtitleKey: 'mainMenu.item.translator.subtitle', to: '/translator' },
const ITEMS: MenuItem[] = [
  { icon: '📘', titleKey: 'mainMenu.item.theory.title', subtitleKey: 'mainMenu.item.theory.subtitle', to: '/theory' },
  { icon: '🧠', titleKey: 'mainMenu.item.psych.title', subtitleKey: 'mainMenu.item.psych.subtitle', to: '/psych' },
  { icon: '🚦', titleKey: 'mainMenu.item.signs.title', subtitleKey: 'mainMenu.item.signs.subtitle', to: '/signs' },
  { icon: '🗺', titleKey: 'mainMenu.item.roadmap.title', subtitleKey: 'mainMenu.item.roadmap.subtitle', to: '/roadmap' },
  { icon: '🚗', titleKey: 'mainMenu.item.driver.title', subtitleKey: 'mainMenu.item.driver.subtitle', to: '/driver' },
  { icon: '🚨', titleKey: 'mainMenu.item.violations.title', subtitleKey: 'mainMenu.item.violations.subtitle', to: '/violations' },
];

export function MainMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col dm-enter">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Logo size={44} />
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: 'var(--dm-text)' }}>
            DriveMaster <span style={{ color: 'var(--dm-orange)' }}>AI</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--dm-text-muted)' }}>
            {t('mainMenu.tagline')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="dm-press flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 40,
            height: 40,
            background: 'var(--dm-card)',
            border: '1px solid var(--dm-border)',
            fontSize: 18,
          }}
        >
          👤
        </button>
      </header>

      <div className="flex-1 px-5 pb-6 flex flex-col gap-3">
        {ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            disabled={item.disabled}
            onClick={() => navigate(item.to)}
            className="dm-press flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
            style={{
              background: 'var(--dm-card)',
              border: '1px solid var(--dm-border-hairline)',
              boxShadow: 'var(--dm-shadow)',
              opacity: item.disabled ? 0.5 : 1,
            }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 48, height: 48, background: 'var(--dm-bg-elevated)', fontSize: 24 }}
            >
              {item.icon}
            </span>
            <span className="flex-1">
              <span className="block font-semibold" style={{ color: 'var(--dm-text)' }}>
                {t(item.titleKey)}
              </span>
              <span className="block text-sm" style={{ color: 'var(--dm-text-muted)' }}>
                {t(item.subtitleKey)}
              </span>
            </span>
            <span style={{ color: 'var(--dm-gold)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
