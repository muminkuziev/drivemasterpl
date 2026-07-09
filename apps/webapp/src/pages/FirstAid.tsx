import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';

const NUMBERS = [
  { number: '112', key: 'number112' },
  { number: '999', key: 'number999' },
  { number: '998', key: 'number998' },
  { number: '997', key: 'number997' },
];

const STEP_ICONS = ['⚠️', '📞', '🗣️', '🩹', '🚓'];
const STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5'];

export function FirstAid() {
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
          🚑 {t('firstAid.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4 overflow-y-auto">
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--dm-gold)' }}>
            {t('firstAid.numbersTitle')}
          </p>
          <div className="flex flex-col gap-2">
            {NUMBERS.map((n) => (
              <div key={n.number} className="flex items-center gap-3">
                <span
                  className="font-bold rounded-lg px-2.5 py-1 shrink-0"
                  style={{ background: 'var(--dm-border)', color: 'var(--dm-text)', minWidth: 52, textAlign: 'center' }}
                >
                  {n.number}
                </span>
                <span className="text-sm" style={{ color: 'var(--dm-text-muted)' }}>
                  {t(`firstAid.${n.key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--dm-text)' }}>
              {STEP_ICONS[i]} {t(`firstAid.${key}.title`)}
            </p>
            <p className="text-sm" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
              {t(`firstAid.${key}.text`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
