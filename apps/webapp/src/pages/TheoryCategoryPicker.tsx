import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProfile, fetchTheoryCategories } from '../api';
import type { TheoryCategory } from '../api';
import { getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const TYPE_ICONS: Record<string, string> = { text: '📝', photo: '🖼', video: '🎥' };

export function TheoryCategoryPicker() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { type } = useParams<{ type: string }>();
  const [categories, setCategories] = useState<TheoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    if (!type) return;
    setLoading(true);
    fetchTheoryCategories(type as 'text' | 'photo' | 'video')
      .then(setCategories)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    fetchProfile(getTelegramId()).then((p) => setIsPremium(p.isPremium));
  }, []);

  const total = categories.reduce((sum, c) => sum + c.count, 0);

  function go(category?: string) {
    haptic('light');
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    navigate(`/theory/${type}/play${q}`);
  }

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
          {TYPE_ICONS[type ?? 'text']} {t(`theoryMenu.type.${type ?? 'text'}`)}
        </h1>
      </header>

      {loading && (
        <p className="text-center mt-8" style={{ color: 'var(--dm-text-muted)' }}>
          {t('common.loading')}
        </p>
      )}

      {!loading && !isPremium && (
        <div className="px-4 pb-2">
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)', boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="text-sm" style={{ color: 'var(--dm-text)' }}>
              ⭐ {t('categoryPicker.freeLimitNotice')}
            </p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex-1 px-4 pb-6 flex flex-col gap-2 overflow-y-auto">
          <button
            type="button"
            onClick={() => go()}
            className="dm-press flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
            style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)', boxShadow: 'var(--dm-shadow)' }}
          >
            <span style={{ fontSize: 20 }}>🔀</span>
            <span className="flex-1 font-semibold" style={{ color: 'var(--dm-text)' }}>
              {t('categoryPicker.mixed')}
            </span>
            <span
              className="text-xs font-bold rounded-full px-2 py-1"
              style={{ background: 'var(--dm-border)', color: 'var(--dm-gold)' }}
            >
              {total}
            </span>
          </button>

          {categories.map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => go(c.category)}
              className="dm-press flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
              style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
            >
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--dm-text)' }}>
                {t(`theoryCategory.${c.category}`)}
              </span>
              <span
                className="text-xs font-bold rounded-full px-2 py-1"
                style={{ background: 'var(--dm-border)', color: 'var(--dm-text-muted)' }}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
