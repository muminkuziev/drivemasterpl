import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchRandomTheoryQuestion, submitTheoryAnswer } from '../api';
import type { TheoryOption, TheoryQuestion } from '../api';
import { getTelegramDisplayName, getTelegramId, haptic } from '../telegram';
import { pickText, useTranslation } from '../i18n/LocaleContext';
import { useProtectedMedia } from '../useProtectedMedia';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

const TYPE_ICONS: Record<string, string> = { text: '📝', photo: '🖼', video: '🎥' };
const LOCALE_FLAG: Record<string, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
const WATERMARK_WARNING: Record<string, string> = {
  uz: 'OGOHLANTIRISH: kontentni yozib olish taqiqlangan. Yana takrorlansa akkauntingiz bloklanadi.',
  ru: 'ПРЕДУПРЕЖДЕНИЕ: запись контента запрещена. При повторении аккаунт будет заблокирован.',
  en: 'WARNING: recording this content is forbidden. Repeated abuse will block your account.',
};

interface HistoryEntry {
  question: TheoryQuestion;
  selected: TheoryOption | null;
  feedback: { isCorrect: boolean; correctOption: TheoryOption | null } | null;
}

export function TheoryQuiz() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') ?? undefined;

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    setHistory([]);
    setIndex(-1);
    void loadNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category]);

  async function loadNew() {
    setLoading(true);
    setEmpty(false);
    try {
      const q = await fetchRandomTheoryQuestion((type as 'text' | 'photo' | 'video') ?? 'text', category);
      setHistory((h) => {
        const next = [...h, { question: q, selected: null, feedback: null }];
        setIndex(next.length - 1);
        return next;
      });
    } catch {
      setEmpty(true);
    } finally {
      setLoading(false);
    }
  }

  const current = index >= 0 ? history[index] : null;
  const mediaBlobUrl = useProtectedMedia(current?.question.imageUrl ?? null);
  const telegramId = getTelegramId();
  const displayName = getTelegramDisplayName();
  const watermarkLabel = displayName ? `${displayName} | ID: ${telegramId}` : `ID: ${telegramId}`;
  const watermarkDate = new Date().toLocaleString(locale === 'uz' ? 'uz-UZ' : locale);
  const watermarkWarning = WATERMARK_WARNING[locale] ?? WATERMARK_WARNING.uz;

  async function onSelect(option: TheoryOption) {
    if (!current || current.selected) return;
    const res = await submitTheoryAnswer(current.question.id, option.id);
    haptic(res.isCorrect ? 'light' : 'heavy');
    setHistory((h) =>
      h.map((entry, i) => (i === index ? { ...entry, selected: option, feedback: res } : entry)),
    );
  }

  function goPrev() {
    if (index <= 0) return;
    haptic('light');
    setIndex(index - 1);
  }

  function goNext() {
    haptic('light');
    if (index < history.length - 1) {
      setIndex(index + 1);
    } else {
      void loadNew();
    }
  }

  const flag = LOCALE_FLAG[locale] ?? '🇺🇿';

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
        <h1 className="text-lg font-bold flex-1" style={{ color: '#f5f7fa' }}>
          {TYPE_ICONS[type ?? 'text']} {t(`theoryMenu.type.${type ?? 'text'}`)}
        </h1>
        {history.length > 0 && (
          <span className="text-xs font-bold" style={{ color: '#9aa4bf' }}>
            {index + 1}
          </span>
        )}
      </header>

      {loading && (
        <p className="text-center mt-8" style={{ color: '#9aa4bf' }}>
          {t('common.loading')}
        </p>
      )}

      {empty && !loading && (
        <p className="text-center mt-8 px-8" style={{ color: '#9aa4bf' }}>
          {t('theoryQuiz.empty')}
        </p>
      )}

      {current && !loading && (
        <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto">
          {current.question.category && (
            <p className="text-xs mb-2" style={{ color: '#d4af37' }}>
              🏷 {t(`theoryCategory.${current.question.category}`)}
            </p>
          )}

          {current.question.imageUrl && mediaBlobUrl && (
            <div className="relative mb-3" style={{ borderRadius: 16, overflow: 'hidden' }}>
              {current.question.mediaType === 'video' ? (
                <video
                  key={current.question.id}
                  src={mediaBlobUrl}
                  controls
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(event) => event.preventDefault()}
                  className="w-full rounded-2xl"
                  style={{ maxHeight: 220, background: '#000', userSelect: 'none' }}
                />
              ) : (
                <img
                  src={mediaBlobUrl}
                  alt=""
                  draggable={false}
                  onContextMenu={(event) => event.preventDefault()}
                  onDragStart={(event) => event.preventDefault()}
                  className="w-full rounded-2xl object-contain"
                  style={{ maxHeight: 220, background: '#f5f7fa', userSelect: 'none' }}
                />
              )}
            </div>
          )}

          {current.question.imageUrl && mediaBlobUrl && (
            <WatermarkOverlay
              label={watermarkLabel}
              dateLabel={watermarkDate}
              warning={watermarkWarning}
              fullScreen
            />
          )}

          <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: '#1a2338', border: '1px solid #2a3350' }}
          >
            <p style={{ color: '#f5f7fa' }}>❓ {current.question.textPl}</p>
            <p className="mt-1" style={{ color: '#9aa4bf' }}>
              {flag}{' '}
              {pickText(locale, {
                uz: current.question.textUz,
                ru: current.question.textRu,
                en: current.question.textEn,
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {current.question.options.map((opt, i) => {
              const isSelected = current.selected?.id === opt.id;
              const isCorrectOpt = current.feedback?.correctOption?.id === opt.id;
              let bg = '#1a2338';
              let border = '#2a3350';
              if (current.feedback && isCorrectOpt) {
                bg = 'rgba(34,197,94,0.15)';
                border = '#22c55e';
              } else if (current.feedback && isSelected && !current.feedback.isCorrect) {
                bg = 'rgba(239,68,68,0.15)';
                border = '#ef4444';
              }
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!!current.selected}
                  onClick={() => onSelect(opt)}
                  className="text-left rounded-xl px-4 py-3"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <span className="font-semibold" style={{ color: '#d4af37' }}>
                    {String.fromCharCode(65 + i)})
                  </span>{' '}
                  <span style={{ color: '#f5f7fa' }}>{opt.textPl}</span>
                  <br />
                  <span className="text-sm" style={{ color: '#9aa4bf' }}>
                    {flag} {pickText(locale, { uz: opt.textUz, ru: opt.textRu, en: opt.textEn })}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={index <= 0}
              className="rounded-2xl px-5 py-4 font-bold"
              style={{
                background: '#1a2338',
                border: '1px solid #2a3350',
                color: index <= 0 ? '#4a5372' : '#f5f7fa',
                opacity: index <= 0 ? 0.5 : 1,
              }}
            >
              ⬅️ {t('common.prev')}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!current.selected}
              className="flex-1 rounded-2xl px-5 py-4 font-bold"
              style={{
                background: current.selected ? '#d4af37' : '#1a2338',
                color: current.selected ? '#0b1220' : '#4a5372',
                border: current.selected ? 'none' : '1px solid #2a3350',
              }}
            >
              {t('common.next')} ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
