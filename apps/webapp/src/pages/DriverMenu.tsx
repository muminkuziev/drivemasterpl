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
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xl px-1"
          style={{ color: '#f5f7fa' }}
        >
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          🚗 {t('driverMenu.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
            style={{ background: '#1a2338', border: '1px solid #2a3350' }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 48, height: 48, background: '#141b2e', fontSize: 24 }}
            >
              {item.icon}
            </span>
            <span className="flex-1 font-semibold" style={{ color: '#f5f7fa' }}>
              {t(`driverMenu.item.${item.key}`)}
            </span>
            <span style={{ color: '#d4af37' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
