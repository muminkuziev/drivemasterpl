import { useLocation, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icons';
import { useTranslation } from '../i18n/LocaleContext';

// Faqat mavjud bo'limlarga olib boradi (yangi funksiya qo'shilmagan)
const TABS: { icon: IconName; key: string; to: string }[] = [
  { icon: 'home', key: 'home', to: '/menu' },
  { icon: 'list', key: 'theory', to: '/theory' },
  { icon: 'warn', key: 'signs', to: '/signs' },
  { icon: 'car', key: 'driver', to: '/driver' },
  { icon: 'user', key: 'profile', to: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="dmh-nav" aria-label="Navigation">
      {TABS.map((tab) => {
        const active = pathname === tab.to || (tab.to !== '/menu' && pathname.startsWith(tab.to + '/'));
        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            className={`dmh-nav-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={tab.icon} size={22} strokeWidth={active ? 2.1 : 1.7} />
            <span>{t(`home.nav.${tab.key}`)}</span>
          </button>
        );
      })}
    </nav>
  );
}
