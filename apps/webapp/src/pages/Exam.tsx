import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { answerExam, ExamError, finishExam, startExam } from '../api';
import type { ExamOption, ExamQuestion, ExamState } from '../api';
import { haptic } from '../telegram';
import { pickText, useTranslation } from '../i18n/LocaleContext';
import { useProtectedMedia } from '../useProtectedMedia';

const LOCALE_FLAG: Record<string, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧', pl: '🇵🇱', uk: '\u{1F1FA}\u{1F1E6}' };

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const card = { background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' } as const;

function QuestionView({
  q,
  review,
  onSelect,
}: {
  q: ExamQuestion;
  review: boolean;
  onSelect?: (o: ExamOption) => void;
}) {
  const { locale } = useTranslation();
  const flag = LOCALE_FLAG[locale] ?? '🇺🇿';
  const media = useProtectedMedia(q.imageUrl);
  const abc = q.options.length > 2;
  return (
    <>
      {q.imageUrl && media && (
        <div className="mb-3" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {q.mediaType === 'video' ? (
            <video
              key={q.id}
              src={media}
              controls
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="w-full rounded-2xl"
              style={{ maxHeight: 220, background: '#000', userSelect: 'none' }}
            />
          ) : (
            <img
              src={media}
              alt=""
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full rounded-2xl object-contain"
              style={{ maxHeight: 220, background: 'var(--dm-text)', userSelect: 'none' }}
            />
          )}
        </div>
      )}
      <div className="rounded-2xl p-4 mb-3" style={card}>
        <p style={{ color: 'var(--dm-text)' }}>❓ {q.textPl}</p>
        {locale !== 'pl' && (
          <p className="mt-1" style={{ color: 'var(--dm-text-muted)' }}>
            {locale === 'uk' && !q.textUk ? '\u{1F1F7}\u{1F1FA}' : flag}{' '}
            {pickText(locale, { uz: q.textUz, ru: q.textRu, en: q.textEn, uk: q.textUk })}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const selected = q.selectedOptionId === opt.id;
          let bg = selected ? 'rgba(212,175,55,0.15)' : 'var(--dm-card)';
          let border = selected ? 'var(--dm-gold)' : 'var(--dm-border)';
          if (review) {
            if (opt.isCorrect) {
              bg = 'rgba(34,197,94,0.15)';
              border = 'var(--dm-success)';
            } else if (selected) {
              bg = 'rgba(239,68,68,0.15)';
              border = 'var(--dm-error)';
            } else {
              bg = 'var(--dm-card)';
              border = 'var(--dm-border)';
            }
          }
          return (
            <button
              key={opt.id}
              type="button"
              disabled={review}
              onClick={() => onSelect?.(opt)}
              className="dm-press text-left rounded-xl px-4 py-3"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              {abc && (
                <span className="font-semibold" style={{ color: 'var(--dm-gold)' }}>
                  {String.fromCharCode(65 + i)}){' '}
                </span>
              )}
              <span style={{ color: 'var(--dm-text)' }}>{opt.textPl}</span>
              {locale !== 'pl' && (
                <>
                  <br />
                  <span className="text-sm" style={{ color: 'var(--dm-text-muted)' }}>
                    {locale === 'uk' && !opt.textUk ? '\u{1F1F7}\u{1F1FA}' : flag}{' '}
                    {pickText(locale, { uz: opt.textUz, ru: opt.textRu, en: opt.textEn, uk: opt.textUk })}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export function Exam() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'intro' | 'loading' | 'run' | 'result'>('intro');
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamState | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [reviewIdx, setReviewIdx] = useState<number | null>(null);
  const deadline = useRef(0);
  const finishing = useRef(false);

  async function begin() {
    setPhase('loading');
    setError(null);
    try {
      const s = await startExam();
      open(s);
    } catch (e) {
      setError(e instanceof ExamError ? e.code : 'error');
      setPhase('intro');
    }
  }

  function open(s: ExamState) {
    setExam(s);
    finishing.current = false;
    if (s.finished) {
      setPhase('result');
      return;
    }
    deadline.current = Date.now() + s.remainingMs;
    setRemaining(s.remainingMs);
    const firstOpen = s.questions.findIndex((q) => !q.selectedOptionId);
    setIndex(firstOpen < 0 ? 0 : firstOpen);
    setPhase('run');
  }

  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => {
      const left = deadline.current - Date.now();
      setRemaining(left);
      if (left <= 0) void finish();
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, exam?.id]);

  async function finish() {
    if (!exam || finishing.current) return;
    finishing.current = true;
    setConfirming(false);
    setPhase('loading');
    try {
      setExam(await finishExam(exam.id));
      setPhase('result');
    } catch {
      finishing.current = false;
      setError('error');
      setPhase('run');
    }
  }

  async function select(opt: ExamOption) {
    if (!exam) return;
    const q = exam.questions[index];
    if (q.selectedOptionId === opt.id) return;
    const prev = q.selectedOptionId;
    haptic('light');
    setExam({
      ...exam,
      questions: exam.questions.map((x, i) => (i === index ? { ...x, selectedOptionId: opt.id } : x)),
    });
    try {
      await answerExam(exam.id, q.id, opt.id);
      setError(null);
    } catch (e) {
      setExam((cur) =>
        cur ? { ...cur, questions: cur.questions.map((x, i) => (i === index ? { ...x, selectedOptionId: prev } : x)) } : cur,
      );
      if (e instanceof ExamError && (e.code === 'expired' || e.code === 'finished')) void finish();
      else setError('answer');
    }
  }

  const answered = useMemo(() => exam?.questions.filter((q) => q.selectedOptionId).length ?? 0, [exam]);

  const header = (title: string, right?: string) => (
    <header className="dmp-head flex items-center gap-3 px-4 pt-6 pb-3">
      <button type="button" onClick={() => navigate(-1)} className="text-xl px-1" style={{ color: 'var(--dm-text)' }}>
        ‹
      </button>
      <h1 className="text-lg font-bold flex-1" style={{ color: 'var(--dm-text)' }}>
        {title}
      </h1>
      {right && (
        <span className="text-sm font-bold" style={{ color: 'var(--dm-gold)' }}>
          {right}
        </span>
      )}
    </header>
  );

  if (phase === 'loading') {
    return (
      <div className="flex-1 flex flex-col dm-enter">
        {header(t('exam.title'))}
        <p className="text-center mt-8" style={{ color: 'var(--dm-text-muted)' }}>
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="flex-1 flex flex-col dm-enter">
        {header(t('exam.title'))}
        <div className="px-4 pb-6 overflow-y-auto">
          <div className="rounded-2xl p-4 mb-3" style={card}>
            <p className="font-bold mb-2" style={{ color: 'var(--dm-text)' }}>
              {t('exam.rulesTitle')}
            </p>
            <ul className="text-sm" style={{ color: 'var(--dm-text-muted)', paddingLeft: 18, listStyle: 'disc' }}>
              <li>{t('exam.rule1')}</li>
              <li>{t('exam.rule2')}</li>
              <li>{t('exam.rule3')}</li>
              <li>{t('exam.rule4')}</li>
            </ul>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--dm-text-muted)' }}>
            {t('exam.langNote')}
          </p>
          {error && (
            <p className="text-sm mb-3" style={{ color: 'var(--dm-error)' }}>
              {error === 'premium_required' ? t('exam.premiumRequired') : t('exam.error')}
            </p>
          )}
          <button
            type="button"
            onClick={begin}
            className="dm-press w-full rounded-2xl px-5 py-4 font-bold"
            style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
          >
            {t('exam.start')}
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  if (phase === 'result') {
    const r = exam.result!;
    return (
      <div className="flex-1 flex flex-col dm-enter">
        {header(t('exam.result'))}
        <div className="px-4 pb-8 overflow-y-auto">
          <div className="rounded-2xl p-5 mb-4 text-center" style={card}>
            <p className="text-4xl font-bold" style={{ color: r.passed ? 'var(--dm-success)' : 'var(--dm-error)' }}>
              {r.score} / {r.maxScore}
            </p>
            <p className="mt-1 font-bold" style={{ color: r.passed ? 'var(--dm-success)' : 'var(--dm-error)' }}>
              {r.passed ? `✅ ${t('exam.passed')}` : `❌ ${t('exam.failed')}`}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--dm-text-muted)' }}>
              {t('exam.passNeeded')}: {exam.passScore}
            </p>
          </div>

          <p className="font-bold mb-2" style={{ color: 'var(--dm-text)' }}>
            {t('exam.review')}
          </p>
          <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
            {exam.questions.map((q, i) => {
              const mark = q.isCorrect ? 'var(--dm-success)' : q.selectedOptionId ? 'var(--dm-error)' : 'var(--dm-text-muted)';
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setReviewIdx(reviewIdx === i ? null : i)}
                  className="dm-press rounded-lg py-2 text-sm font-bold"
                  style={{ border: `2px solid ${mark}`, color: mark, background: reviewIdx === i ? 'var(--dm-card)' : 'transparent' }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--dm-text-muted)' }}>
            🟢 {t('exam.correct')} · 🔴 {t('exam.wrong')} · ⚪ {t('exam.unanswered')}
          </p>

          {reviewIdx !== null && (
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: 'var(--dm-gold)' }}>
                #{reviewIdx + 1} · {exam.questions[reviewIdx].points} {t('common.pointsShort')}
              </p>
              <QuestionView q={exam.questions[reviewIdx]} review />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setReviewIdx(null);
              void begin();
            }}
            className="dm-press w-full rounded-2xl px-5 py-4 font-bold"
            style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
          >
            {t('exam.again')}
          </button>
        </div>
      </div>
    );
  }

  const q = exam.questions[index];
  const last = index === exam.questions.length - 1;
  const low = remaining < 60_000;
  return (
    <div className="flex-1 flex flex-col dm-enter">
      {header(`${t('exam.title')} ${index + 1}/${exam.questions.length}`, fmt(remaining))}
      <div className="px-4 pb-6 overflow-y-auto flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--dm-text-muted)' }}>
          <span>{q.scope === 'basic' ? t('exam.basic') : t('exam.specialist')}</span>
          <span>·</span>
          <span style={{ color: 'var(--dm-gold)' }}>
            {q.points} {t('common.pointsShort')}
          </span>
          <span style={{ marginLeft: 'auto', color: low ? 'var(--dm-error)' : undefined }}>
            {answered}/{exam.questions.length}
          </span>
        </div>
        <QuestionView q={q} review={false} onSelect={select} />
        {error === 'answer' && (
          <p className="text-sm mt-2" style={{ color: 'var(--dm-error)' }}>
            {t('exam.answerFailed')}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="dm-press rounded-2xl px-5 py-4 font-bold"
            style={{ ...card, color: 'var(--dm-text)', opacity: index === 0 ? 0.5 : 1 }}
          >
            ⬅️
          </button>
          {!last ? (
            <button
              type="button"
              onClick={() => setIndex(index + 1)}
              className="dm-press flex-1 rounded-2xl px-5 py-4 font-bold"
              style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
            >
              {t('common.next')} ➡️
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="dm-press flex-1 rounded-2xl px-5 py-4 font-bold"
              style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
            >
              {t('exam.finish')}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm mt-4 self-center"
          style={{ color: 'var(--dm-text-muted)' }}
        >
          {t('exam.finishEarly')}
        </button>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}
        >
          <div className="rounded-2xl p-5 w-full" style={{ ...card, maxWidth: 360 }}>
            <p className="font-bold mb-1" style={{ color: 'var(--dm-text)' }}>
              {t('exam.confirmTitle')}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--dm-text-muted)' }}>
              {t('exam.confirmText').replace('{answered}', String(answered)).replace('{total}', String(exam.questions.length))}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="dm-press flex-1 rounded-xl py-3 font-bold"
                style={{ ...card, color: 'var(--dm-text)' }}
              >
                {t('exam.continue')}
              </button>
              <button
                type="button"
                onClick={() => void finish()}
                className="dm-press flex-1 rounded-xl py-3 font-bold"
                style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
              >
                {t('exam.finish')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
