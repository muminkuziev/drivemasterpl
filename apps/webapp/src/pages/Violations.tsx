import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';

const SPEED_TABLE = [
  { rowKey: 'speedRow0', fine: '50 zł', points: 1 },
  { rowKey: 'speedRow1', fine: '100 zł', points: 2 },
  { rowKey: 'speedRow2', fine: '200 zł', points: 3 },
  { rowKey: 'speedRow3', fine: '300 zł', points: 5 },
  { rowKey: 'speedRow4', fine: '400 zł', points: 7 },
  { rowKey: 'speedRow5', fine: '800 zł (qayta — 1600 zł)', points: 9 },
  { rowKey: 'speedRow6', fine: '1000 zł (qayta — 2000 zł)', points: 11 },
  { rowKey: 'speedRow7', fine: '1500 zł (qayta — 3000 zł)', points: 13 },
  { rowKey: 'speedRow8', fine: '2000 zł (qayta — 4000 zł)', points: 14 },
  { rowKey: 'speedRow9', fine: '2500 zł (qayta — 5000 zł)', points: 15 },
];

const COMMON = [
  { icon: '🚦', key: 'redLight', fine: '500 zł', points: 15 },
  { icon: '📱', key: 'phone', fine: '500 zł', points: 12 },
  { icon: '⚡', key: 'speed', fineKey: 'violations.speed.fine', points: 0 },
  { icon: '🚸', key: 'pedestrian', fine: '1500 zł', points: 15 },
];

export function Violations() {
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
          🚨 {t('violations.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4 overflow-y-auto">
        <p className="text-xs" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
          {t('violations.intro')}
        </p>

        <div className="flex flex-col gap-3">
          {COMMON.map((v) => (
            <div
              key={v.key}
              className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ fontSize: 20 }}>{v.icon}</span>
                <span className="font-semibold text-sm flex-1" style={{ color: 'var(--dm-text)' }}>
                  {t(`violations.${v.key}.title`)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-bold rounded-lg px-2 py-1"
                  style={{ background: 'var(--dm-error)', color: 'var(--dm-text)' }}
                >
                  {v.fineKey ? t(v.fineKey) : v.fine}
                </span>
                {v.points > 0 && (
                  <span
                    className="text-xs font-bold rounded-lg px-2 py-1"
                    style={{ background: 'var(--dm-border)', color: 'var(--dm-gold)' }}
                  >
                    {v.points} {t('common.points')}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
                {t(`violations.${v.key}.note`)}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--dm-gold)' }}>
            {t('violations.speedTableTitle')}
          </p>
          <div className="flex flex-col">
            {SPEED_TABLE.map((row, i) => (
              <div
                key={row.rowKey}
                className="flex items-center justify-between py-1.5"
                style={{ borderTop: i > 0 ? '1px solid var(--dm-border)' : undefined }}
              >
                <span className="text-xs" style={{ color: 'var(--dm-text)', flex: 1 }}>
                  {t(`violations.${row.rowKey}`)}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--dm-text-muted)', width: 130, textAlign: 'right' }}>
                  {row.fine}
                </span>
                <span
                  className="text-xs font-bold rounded px-1.5 ml-2"
                  style={{ background: 'var(--dm-border)', color: 'var(--dm-gold)', minWidth: 44, textAlign: 'center' }}
                >
                  {row.points} {t('common.pointsShort')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-error)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--dm-text)' }}>
            {t('violations.drunkDriving.title')}
          </p>
          <p className="text-sm mb-2" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
            {t('violations.drunkDriving.intro')}
          </p>
          <div className="flex flex-col gap-2">
            <div className="rounded-xl px-3 py-2" style={{ background: 'var(--dm-bg-elevated)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--dm-orange)' }}>
                {t('violations.drunkDriving.tier1Title')}
              </p>
              <p className="text-xs" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
                {t('violations.drunkDriving.tier1Text')}
              </p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ background: 'var(--dm-bg-elevated)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--dm-error)' }}>
                {t('violations.drunkDriving.tier2Title')}
              </p>
              <p className="text-xs" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
                {t('violations.drunkDriving.tier2Text')}
              </p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
            {t('violations.drunkDriving.note')}
          </p>
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--dm-text)' }}>
            {t('violations.pointsSystem.title')}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: t('violations.pointsSystem.text') }}
          />
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
        >
          <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--dm-text)' }}>
            {t('violations.courtRights.title')}
          </p>
          <p className="text-sm" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
            {t('violations.courtRights.text')}
          </p>
        </div>
      </div>
    </div>
  );
}
