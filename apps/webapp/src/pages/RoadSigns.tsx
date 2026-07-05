import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchRoadSignCategories, fetchRoadSignsByCategory } from '../api';
import type { RoadSign, RoadSignCategory } from '../api';
import { haptic } from '../telegram';
import { pickText, useTranslation } from '../i18n/LocaleContext';

export function RoadSigns() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('category');
  const [categories, setCategories] = useState<RoadSignCategory[]>([]);
  const [signs, setSigns] = useState<RoadSign[]>([]);
  const [loadingSigns, setLoadingSigns] = useState(false);

  useEffect(() => {
    fetchRoadSignCategories().then((cats) => {
      setCategories(cats);
      if (!searchParams.get('category')) {
        const firstNonEmpty = cats.find((c) => c.count > 0) ?? cats[0];
        if (firstNonEmpty) setSearchParams({ category: firstNonEmpty.key }, { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectCategory(key: string) {
    haptic('light');
    setSearchParams({ category: key }, { replace: true });
  }

  useEffect(() => {
    if (!selected) return;
    setLoadingSigns(true);
    fetchRoadSignsByCategory(selected)
      .then(setSigns)
      .finally(() => setLoadingSigns(false));
  }, [selected]);

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
          🚦 {t('signs.title')}
        </h1>
      </header>

      <div
        className="flex gap-3 overflow-x-auto px-4 pb-4 shrink-0"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {categories.map((cat) => {
          const isSelected = cat.key === selected;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => selectCategory(cat.key)}
              className="flex flex-col items-center gap-1.5 shrink-0 rounded-2xl px-3 py-2.5 transition-colors"
              style={{
                width: 84,
                scrollSnapAlign: 'start',
                background: isSelected ? '#1a2338' : 'transparent',
                border: isSelected ? '1.5px solid #d4af37' : '1.5px solid #2a3350',
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, background: '#141b2e', fontSize: 20 }}
              >
                {cat.icon}
              </span>
              <span
                className="text-[11px] leading-tight text-center"
                style={{ color: isSelected ? '#f5f7fa' : '#9aa4bf' }}
              >
                {t(`signs.category.${cat.key}`)}
              </span>
              {cat.count > 0 && (
                <span
                  className="text-[10px] rounded-full px-1.5"
                  style={{ background: '#2a3350', color: '#d4af37' }}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loadingSigns && (
          <p className="text-center mt-8" style={{ color: '#9aa4bf' }}>
            {t('common.loading')}
          </p>
        )}
        {!loadingSigns && signs.length === 0 && (
          <p className="text-center mt-8" style={{ color: '#9aa4bf' }}>
            {t('signs.empty')}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {signs.map((sign) => {
            const name = pickText(locale, { pl: sign.namePl, uz: sign.nameUz, ru: sign.nameRu, en: sign.nameEn });
            const description = pickText(locale, {
              uz: sign.descriptionUz,
              ru: sign.descriptionRu,
              en: sign.descriptionEn,
            });
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => {
                  haptic('light');
                  navigate(`/signs/${sign.id}`);
                }}
                className="flex gap-3 rounded-2xl p-3 text-left"
                style={{ background: '#1a2338', border: '1px solid #2a3350' }}
              >
                {sign.imageUrl ? (
                  <img
                    src={sign.imageUrl}
                    alt={name}
                    className="rounded-xl object-contain shrink-0"
                    style={{ width: 64, height: 64, background: '#f5f7fa' }}
                  />
                ) : (
                  <span
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: 64, height: 64, background: '#141b2e', fontSize: 24 }}
                  >
                    👮
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {sign.code && (
                      <span
                        className="text-xs font-bold rounded px-1.5 py-0.5 shrink-0"
                        style={{ background: '#2a3350', color: '#d4af37' }}
                      >
                        {sign.code}
                      </span>
                    )}
                    <span className="font-semibold text-sm" style={{ color: '#f5f7fa' }}>
                      {name}
                    </span>
                  </div>
                  {sign.namePl && (
                    <p className="text-xs mt-1" style={{ color: '#9aa4bf' }}>
                      🇵🇱 {sign.namePl}
                    </p>
                  )}
                  {description && (
                    <p className="text-xs mt-1" style={{ color: '#9aa4bf' }}>
                      {description}
                    </p>
                  )}
                </div>
                <span className="self-center" style={{ color: '#d4af37' }}>
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
