import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchWordCenterVoivodeships, fetchWordCentersByVoivodeship } from '../api';
import type { WordCenter, WordCenterVoivodeship } from '../api';
import { haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const DEFAULT_VOIVODESHIP_LABEL = 'mazowieckie';

export function WordCenters() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('voivodeship');
  const [voivodeships, setVoivodeships] = useState<WordCenterVoivodeship[]>([]);
  const [centers, setCenters] = useState<WordCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  useEffect(() => {
    fetchWordCenterVoivodeships().then((rows) => {
      setVoivodeships(rows);
      if (!searchParams.get('voivodeship')) {
        const preferred =
          rows.find((r) => r.label.toLowerCase() === DEFAULT_VOIVODESHIP_LABEL) ?? rows[0];
        if (preferred) setSearchParams({ voivodeship: preferred.voivodeship }, { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectVoivodeship(voivodeship: string) {
    haptic('light');
    setSearchParams({ voivodeship }, { replace: true });
  }

  useEffect(() => {
    if (!selected) return;
    setLoadingCenters(true);
    fetchWordCentersByVoivodeship(selected)
      .then(setCenters)
      .finally(() => setLoadingCenters(false));
  }, [selected]);

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
          🏢 {t('wordCenters.title')}
        </h1>
      </header>

      <p className="text-xs px-4 pb-3" style={{ color: 'var(--dm-text-muted)', lineHeight: 1.5 }}>
        {t('wordCenters.subtitle')}
      </p>

      <div
        className="flex gap-2 overflow-x-auto px-4 pb-4 shrink-0"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {voivodeships.map((v) => {
          const isSelected = v.voivodeship === selected;
          return (
            <button
              key={v.voivodeship}
              type="button"
              onClick={() => selectVoivodeship(v.voivodeship)}
              className="dm-press shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
              style={{
                scrollSnapAlign: 'start',
                background: isSelected ? 'var(--dm-gold)' : 'var(--dm-card)',
                color: isSelected ? 'var(--dm-bg)' : 'var(--dm-text)',
                border: isSelected ? 'none' : '1px solid var(--dm-border)',
              }}
            >
              {v.label} <span style={{ opacity: 0.7 }}>({v.count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loadingCenters && (
          <p className="text-center mt-8" style={{ color: 'var(--dm-text-muted)' }}>
            {t('common.loading')}
          </p>
        )}
        {!loadingCenters && centers.length === 0 && (
          <p className="text-center mt-8" style={{ color: 'var(--dm-text-muted)' }}>
            {t('wordCenters.empty')}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {centers.map((center) => (
            <div
              key={center.id}
              className="rounded-2xl px-4 py-3"
              style={{
                background: 'var(--dm-card)',
                border: '1px solid var(--dm-border)',
                boxShadow: 'var(--dm-shadow)',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--dm-text)' }}>
                {center.name}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--dm-text-muted)' }}>
                {center.city} — {center.address}
              </p>
              {center.website && (
                <a
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => haptic('light')}
                  className="dm-press inline-block mt-2 text-sm font-semibold"
                  style={{ color: 'var(--dm-gold)' }}
                >
                  🌐 {t('wordCenters.website')}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
