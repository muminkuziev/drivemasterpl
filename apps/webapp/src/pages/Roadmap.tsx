import { useNavigate } from 'react-router-dom';
import { haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const STEPS = [
  { icon: '1️⃣', key: 'step1', hasNote: true, to: '/psych' },
  { icon: '2️⃣', key: 'step2', to: '/theory' },
  { icon: '3️⃣', key: 'step3', to: '/theory' },
  { icon: '4️⃣', key: 'step4' },
  { icon: '5️⃣', key: 'step5', to: '/signs' },
];

export function Roadmap() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function onStepClick(to?: string) {
    if (!to) return;
    haptic('light');
    navigate(to);
  }

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
          🗺 {t('roadmap.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {STEPS.map((step) => {
          const clickable = Boolean(step.to);
          return (
            <button
              key={step.key}
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick(step.to)}
              className="flex items-start gap-3 rounded-2xl px-4 py-3 text-left"
              style={{
                background: '#1a2338',
                border: clickable ? '1px solid #2a3350' : '1px dashed #2a3350',
                opacity: clickable ? 1 : 0.8,
              }}
            >
              <span style={{ fontSize: 20 }}>{step.icon}</span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#f5f7fa' }}>
                  {t(`roadmap.${step.key}.title`)}
                </p>
                {step.hasNote && (
                  <p className="text-xs mt-0.5" style={{ color: '#f5a623' }}>
                    ⚠️ {t(`roadmap.${step.key}.note`)}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: '#9aa4bf', lineHeight: 1.5 }}>
                  {t(`roadmap.${step.key}.desc`)}
                </p>
              </div>
              {clickable && (
                <span className="shrink-0" style={{ color: '#d4af37' }}>
                  ›
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
