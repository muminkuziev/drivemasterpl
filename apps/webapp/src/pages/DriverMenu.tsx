import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';

const ITEMS = [
  { icon: '🚑', key: 'firstAid', to: '/driver/first-aid' },
  { icon: '🧯', key: 'equipment', to: '/driver/equipment' },
];

export function DriverMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col dm-enter">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xl px-1"
          style={{ color: 'var(--dm-text)' }}
        >
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--dm-text)' }}>
          🚗 {t('driverMenu.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className="dm-press flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
            style={{
              background: 'var(--dm-card)',
              border: '1px solid var(--dm-border-hairline)',
              boxShadow: 'var(--dm-shadow)',
            }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 48, height: 48, background: 'var(--dm-bg-elevated)', fontSize: 24 }}
            >
              {item.icon}
            </span>
            <span className="flex-1 font-semibold" style={{ color: 'var(--dm-text)' }}>
              {t(`driverMenu.item.${item.key}`)}
            </span>
            <span style={{ color: 'var(--dm-gold)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
