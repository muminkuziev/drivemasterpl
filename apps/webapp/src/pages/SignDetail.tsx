import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRoadSign } from '../api';
import type { RoadSignDetail } from '../api';
import { TrafficControllerDiagram } from '../components/TrafficControllerDiagram';
import { pickText, useTranslation } from '../i18n/LocaleContext';

export function SignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const [sign, setSign] = useState<RoadSignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetchRoadSign(id)
      .then(setSign)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const name = sign
    ? pickText(locale, { pl: sign.namePl, uz: sign.nameUz, ru: sign.nameRu, en: sign.nameEn })
    : '';
  const description = sign
    ? pickText(locale, { uz: sign.descriptionUz, ru: sign.descriptionRu, en: sign.descriptionEn })
    : '';
  const action = sign
    ? pickText(locale, { uz: sign.actionUz, ru: sign.actionRu, en: sign.actionEn })
    : '';

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
          {t('signDetail.title')}
        </h1>
      </header>

      {loading && (
        <p className="text-center mt-8" style={{ color: 'var(--dm-text-muted)' }}>
          {t('common.loading')}
        </p>
      )}

      {error && !loading && (
        <p className="text-center mt-8" style={{ color: 'var(--dm-error)' }}>
          {t('signDetail.notFound')}
        </p>
      )}

      {sign && !loading && (
        <div className="flex-1 px-4 pb-6 flex flex-col gap-4">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ background: '#ffffff', minHeight: 200, padding: 16 }}
          >
            {sign.imageUrl ? (
              <img
                src={sign.imageUrl}
                alt={name}
                className="object-contain"
                style={{ maxHeight: 220, maxWidth: '100%' }}
              />
            ) : sign.category === 'traffic_controller' ? (
              <TrafficControllerDiagram code={sign.code} />
            ) : (
              <span style={{ fontSize: 64 }}>🚧</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sign.code && (
              <span
                className="text-sm font-bold rounded-lg px-2.5 py-1 shrink-0"
                style={{ background: 'var(--dm-border)', color: 'var(--dm-gold)' }}
              >
                {sign.code}
              </span>
            )}
            <h2 className="text-xl font-bold" style={{ color: 'var(--dm-text)' }}>
              {name}
            </h2>
          </div>

          {sign.namePl && (
            <p className="text-sm -mt-2" style={{ color: 'var(--dm-text-muted)' }}>
              🇵🇱 {sign.namePl}
            </p>
          )}

          {description && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
            >
              <p className="text-sm" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.6 }}>
                {description}
              </p>
            </div>
          )}

          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)', boxShadow: 'var(--dm-shadow)' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--dm-gold)' }}
            >
              {t('signDetail.whatToDo')}
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--dm-text)', lineHeight: 1.6 }}>
              {action}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="dm-press rounded-2xl px-5 py-4 font-bold text-center"
            style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', color: 'var(--dm-text)', boxShadow: 'var(--dm-shadow)' }}
          >
            ‹ {t('common.back')}
          </button>
        </div>
      )}
    </div>
  );
}
