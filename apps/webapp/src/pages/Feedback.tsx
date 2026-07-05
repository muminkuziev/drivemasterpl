import { useNavigate } from 'react-router-dom';
import { haptic, openTelegramUser } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const FOUNDER_USERNAME = 'founder_mk';

export function Feedback() {
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
          💬 {t('feedback.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4">
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: '#1a2338', border: '1px solid #2a3350' }}
        >
          <p className="text-sm" style={{ color: '#9aa4bf', lineHeight: 1.6 }}>
            {t('feedback.text')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            haptic('light');
            openTelegramUser(FOUNDER_USERNAME);
          }}
          className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
          style={{ background: '#1a2338', border: '1.5px solid #d4af37' }}
        >
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 48, height: 48, background: '#141b2e', fontSize: 24 }}
          >
            🧑‍💼
          </span>
          <span className="flex-1">
            <span className="block font-semibold" style={{ color: '#f5f7fa' }}>
              {t('feedback.contactFounder')}
            </span>
            <span className="block text-sm" style={{ color: '#9aa4bf' }}>
              @{FOUNDER_USERNAME}
            </span>
          </span>
          <span style={{ color: '#d4af37' }}>›</span>
        </button>
      </div>
    </div>
  );
}
