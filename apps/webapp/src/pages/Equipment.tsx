import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';

interface EquipmentItem {
  icon: string;
  key: string;
  status: 'mandatory' | 'conditional' | 'recommended';
}

const ITEMS: EquipmentItem[] = [
  { icon: '🧯', key: 'item1', status: 'mandatory' },
  { icon: '🔺', key: 'item2', status: 'mandatory' },
  { icon: '🦺', key: 'item3', status: 'conditional' },
  { icon: '🩹', key: 'item4', status: 'recommended' },
];

const STATUS_STYLE: Record<EquipmentItem['status'], { bg: string; color: string }> = {
  mandatory: { bg: 'var(--dm-error)', color: 'var(--dm-text)' },
  conditional: { bg: 'var(--dm-orange)', color: 'var(--dm-bg)' },
  recommended: { bg: 'var(--dm-border)', color: 'var(--dm-text-muted)' },
};

export function Equipment() {
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
          🧯 {t('equipment.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3 overflow-y-auto">
        {ITEMS.map((item) => {
          const s = STATUS_STYLE[item.status];
          return (
            <div
              key={item.key}
              className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span className="font-semibold text-sm flex-1" style={{ color: 'var(--dm-text)' }}>
                  {t(`equipment.${item.key}.title`)}
                </span>
                <span
                  className="text-[10px] font-bold rounded-full px-2 py-1 shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  {t(`equipment.status.${item.status}`)}
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
                {t(`equipment.${item.key}.text`)}
              </p>
              <p className="text-xs italic" style={{ color: '#6b7690' }}>
                📜 {t(`equipment.${item.key}.law`)}
              </p>
            </div>
          );
        })}

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="text-xs" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
            {t('equipment.fineNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
