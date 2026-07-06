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
          {t('signDetail.title')}
        </h1>
      </header>

      {loading && (
        <p className="text-center mt-8" style={{ color: '#9aa4bf' }}>
          {t('common.loading')}
        </p>
      )}

      {error && !loading && (
        <p className="text-center mt-8" style={{ color: '#ef4444' }}>
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
                style={{ background: '#2a3350', color: '#d4af37' }}
              >
                {sign.code}
              </span>
            )}
            <h2 className="text-xl font-bold" style={{ color: '#f5f7fa' }}>
              {name}
            </h2>
          </div>

          {sign.namePl && (
            <p className="text-sm -mt-2" style={{ color: '#9aa4bf' }}>
              🇵🇱 {sign.namePl}
            </p>
          )}

          {description && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: '#1a2338', border: '1px solid #2a3350' }}
            >
              <p className="text-sm" style={{ color: '#9aa4bf', lineHeight: 1.6 }}>
                {description}
              </p>
            </div>
          )}

          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: '#1a2338', border: '1.5px solid #d4af37' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: '#d4af37' }}
            >
              {t('signDetail.whatToDo')}
            </p>
            <p className="text-sm font-medium" style={{ color: '#f5f7fa', lineHeight: 1.6 }}>
              {action}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl px-5 py-4 font-bold text-center"
            style={{ background: '#1a2338', border: '1px solid #2a3350', color: '#f5f7fa' }}
          >
            ‹ {t('common.back')}
          </button>
        </div>
      )}
    </div>
  );
}
