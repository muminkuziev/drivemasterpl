import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LocaleContext';
import { TERMS_CONTENT, PRIVACY_CONTENT } from '../legal/legalContent';

export function Legal() {
  const navigate = useNavigate();
  const { locale } = useTranslation();
  const { doc } = useParams<{ doc: string }>();
  const content = (doc === 'privacy' ? PRIVACY_CONTENT : TERMS_CONTENT)[locale];

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
          📄 {content.title}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4 overflow-y-auto">
        <p className="text-xs" style={{ color: 'var(--dm-text-muted)' }}>
          {content.updated}
        </p>
        {content.sections.map((section, i) => (
          <div
            key={i}
            className="rounded-2xl px-4 py-3.5"
            style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: 'var(--dm-gold)' }}>
              {section.heading}
            </p>
            {section.body.map((paragraph, j) => (
              <p
                key={j}
                className="text-sm mt-1.5 first:mt-0"
                style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
