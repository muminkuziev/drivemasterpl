import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';

const EXERCISES = [
  { icon: '🔎', key: 'attention', to: '/psych/attention' },
  { icon: '⚡', key: 'reaction', to: '/psych/reaction' },
  { icon: '🧩', key: 'coordination', to: '/psych/coordination' },
  { icon: '🎯', key: 'piorkowski', to: '/psych/piorkowski' },
  { icon: '🧠', key: 'krzyzowy', to: '/psych/krzyzowy' },
  { icon: '🚨', key: 'signal', to: '/psych/signal' },
];

export function PsychMenu() {
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
          🧠 {t('psychMenu.title')}
        </h1>
      </header>

      <div
        className="px-4 pb-4"
        style={{ color: '#9aa4bf', fontSize: 13, lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: t('psychMenu.disclaimer') }}
      />

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {EXERCISES.map((ex) => (
          <button
            key={ex.to}
            type="button"
            onClick={() => navigate(ex.to)}
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
            style={{ background: '#1a2338', border: '1px solid #2a3350' }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 48, height: 48, background: '#141b2e', fontSize: 24 }}
            >
              {ex.icon}
            </span>
            <span className="flex-1 font-semibold" style={{ color: '#f5f7fa' }}>
              {t(`psychMenu.exercise.${ex.key}`)}
            </span>
            <span style={{ color: '#d4af37' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
