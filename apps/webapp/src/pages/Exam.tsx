import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { answerExam, confirmExam, ExamError, finishExam, startExam } from '../api';
import type { ExamCurrent, ExamOption, ExamQuestion, ExamState } from '../api';
import { haptic } from '../telegram';
import { pickText, useTranslation } from '../i18n/LocaleContext';
import { useProtectedMedia } from '../useProtectedMedia';

const LOCALE_FLAG: Record<string, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧', pl: '🇵🇱', uk: '\u{1F1FA}\u{1F1E6}' };

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const card = { background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' } as const;

type Phase = 'read' | 'video' | 'answer';

function Media({ q, phase }: { q: ExamQuestion; phase: Phase | 'review' }) {
  const blob = useProtectedMedia(q.imageUrl);
  const { t } = useTranslation();
  if (!q.imageUrl) return null;
  const isVideo = q.mediaType === 'video';
  // Asosiy qism videosi: o'qish tugagach bir marta ko'rsatiladi (boshqaruvsiz). Boshqa hollarda oddiy.
  const onceOnly = isVideo && phase !== 'review' && (phase === 'read' || phase === 'video' || phase === 'answer') && q.scope === 'basic';
  if (isVideo && onceOnly) {
    if (phase === 'read') {
      return (
        <div className="mb-3 rounded-2xl flex items-center justify-center text-sm" style={{ ...card, height: 120, color: 'var(--dm-text-muted)' }}>
          🎥 {t('exam.videoLater')}
        </div>
      );
    }
    if (phase === 'answer') {
      return (
        <div className="mb-3 rounded-2xl flex items-center justify-center text-sm" style={{ ...card, height: 60, color: 'var(--dm-text-muted)' }}>
          🎥 {t('exam.videoShown')}
        </div>
      );
    }
  }
  if (!blob) return null;
  return (
    <div className="mb-3" style={{ borderRadius: 16, overflow: 'hidden' }}>
      {isVideo ? (
        <video
          key={q.id + phase}
          src={blob}
          autoPlay={onceOnly}
          muted={onceOnly}
          playsInline
          controls={!onceOnly}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="w-full rounded-2xl"
          style={{ maxHeight: 220, background: '#000', userSelect: 'none', pointerEvents: onceOnly ? 'none' : 'auto' }}
        />
      ) : (
        <img
          src={blob}
          alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full rounded-2xl object-contain"
          style={{ maxHeight: 220, background: 'var(--dm-text)', userSelect: 'none' }}
        />
      )}
    </div>
  );
}

function QuestionView({
  q,
  phase,
  selectedId,
  locked,
  onSelect,
}: {
  q: ExamQuestion;
  phase: Phase | 'review';
  selectedId: string | null;
  locked: boolean;
  onSelect?: (o: ExamOption) => void;
}) {
  const { locale } = useTranslation();
  const flag = LOCALE_FLAG[locale] ?? '🇺🇿';
  const review = phase === 'review';
  const abc = q.options.length > 2;
  return (
    <>
      <Media q={q} phase={phase} />
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
          const selected = selectedId === opt.id;
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
              disabled={review || locked}
              onClick={() => onSelect?.(opt)}
              className="dm-press text-left rounded-xl px-4 py-3"
              style={{ background: bg, border: `1px solid ${border}`, opacity: !review && locked ? 0.6 : 1 }}
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirming, setConfirming] = useState(false);
  const [reviewIdx, setReviewIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  // Serverdan kelgan vaqt: joriy savolning o'tgan vaqti va shu paytdagi lokal soat
  const base = useRef({ elapsed: 0, at: Date.now(), remaining: 0 });
  const autoFor = useRef<string | null>(null);

  async function begin() {
    setPhase('loading');
    setError(null);
    try {
      open(await startExam());
    } catch (e) {
      setError(e instanceof ExamError ? e.code : 'error');
      setPhase('intro');
    }
  }

  function open(s: ExamState) {
    setExam(s);
    setBusy(false);
    if (s.finished || !s.current) {
      setPhase('result');
      return;
    }
    base.current = { elapsed: s.current.elapsedMs, at: Date.now(), remaining: s.remainingMs };
    setSelectedId(s.current.selectedOptionId);
    setNow(Date.now());
    setPhase('run');
  }

  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const cur: ExamCurrent | null = exam?.current ?? null;
  const elapsed = base.current.elapsed + (now - base.current.at);
  const timing = cur?.timing;
  const curPhase: Phase | null = timing
    ? elapsed < timing.readMs
      ? 'read'
      : elapsed < timing.readMs + timing.videoMs
        ? 'video'
        : 'answer'
    : null;
  const phaseEnd = timing
    ? curPhase === 'read'
      ? timing.readMs
      : curPhase === 'video'
        ? timing.readMs + timing.videoMs
        : timing.totalMs
    : 0;
  const phaseStart = timing
    ? curPhase === 'read'
      ? 0
      : curPhase === 'video'
        ? timing.readMs
        : timing.readMs + timing.videoMs
    : 0;
  const phaseLeft = Math.max(0, phaseEnd - elapsed);
  const totalLeft = Math.max(0, base.current.remaining - (now - base.current.at));

  async function goConfirm() {
    if (!exam || !cur || busy) return;
    setBusy(true);
    setConfirming(false);
    try {
      open(await confirmExam(exam.id, cur.id));
    } catch {
      setBusy(false);
      autoFor.current = null;
      setError('answer');
    }
  }

  // Savol vaqti tugasa — avtomatik tasdiqlash (tanlangan javob bilan yoki javobsiz)
  useEffect(() => {
    if (phase !== 'run' || !cur || !timing) return;
    if (elapsed >= timing.totalMs && autoFor.current !== cur.id) {
      autoFor.current = cur.id;
      void goConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, cur?.id]);

  async function finishNow() {
    if (!exam) return;
    setConfirming(false);
    setPhase('loading');
    try {
      open(await finishExam(exam.id));
    } catch {
      setError('answer');
      setPhase('run');
    }
  }

  async function select(opt: ExamOption) {
    if (!exam || !cur || curPhase !== 'answer' || busy || selectedId === opt.id) return;
    const prev = selectedId;
    haptic('light');
    setSelectedId(opt.id);
    try {
      await answerExam(exam.id, cur.id, opt.id);
      setError(null);
    } catch (e) {
      setSelectedId(prev);
      if (e instanceof ExamError && (e.code === 'expired' || e.code === 'finished')) void goConfirm();
      else setError('answer');
    }
  }

  const header = (title: string, right?: string, rightColor?: string) => (
    <header className="dmp-head flex items-center gap-3 px-4 pt-6 pb-3">
      <button
        type="button"
        onClick={() => (phase === 'run' ? navigate('/menu') : navigate(-1))}
        className="text-xl px-1"
        style={{ color: 'var(--dm-text)' }}
      >
        ‹
      </button>
      <h1 className="text-lg font-bold flex-1" style={{ color: 'var(--dm-text)' }}>
        {title}
      </h1>
      {right && (
        <span className="text-sm font-bold" style={{ color: rightColor ?? 'var(--dm-gold)' }}>
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
              <li>{t('exam.rule5')}</li>
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
    const qs = exam.questions ?? [];
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
            {qs.map((q, i) => {
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

          {reviewIdx !== null && qs[reviewIdx] && (
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: 'var(--dm-gold)' }}>
                #{reviewIdx + 1} · {qs[reviewIdx].points} {t('common.pointsShort')}
              </p>
              <QuestionView q={qs[reviewIdx]} phase="review" selectedId={qs[reviewIdx].selectedOptionId} locked />
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

  if (!cur || !timing || !curPhase) return null;

  const canAnswer = curPhase === 'answer' && !busy;
  const phaseLabel =
    curPhase === 'read' ? t('exam.phaseRead') : curPhase === 'video' ? t('exam.phaseVideo') : t('exam.phaseAnswer');
  const span = Math.max(1, phaseEnd - phaseStart);
  const pct = Math.min(100, Math.max(0, ((elapsed - phaseStart) / span) * 100));
  const urgent = curPhase === 'answer' && phaseLeft < 6000;
  const last = cur.position >= exam.total;

  return (
    <div className="flex-1 flex flex-col dm-enter">
      {header(`${t('exam.title')} ${cur.position}/${exam.total}`, fmt(totalLeft))}
      <div className="px-4 pb-6 overflow-y-auto flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1 text-xs" style={{ color: 'var(--dm-text-muted)' }}>
          <span>{cur.scope === 'basic' ? t('exam.basic') : t('exam.specialist')}</span>
          <span>·</span>
          <span style={{ color: 'var(--dm-gold)' }}>
            {cur.points} {t('common.pointsShort')}
          </span>
          <span style={{ marginLeft: 'auto', color: urgent ? 'var(--dm-error)' : 'var(--dm-text)', fontWeight: 700 }}>
            {phaseLabel} · {Math.ceil(phaseLeft / 1000)} {t('exam.secShort')}
          </span>
        </div>
        <div className="mb-3" style={{ height: 4, borderRadius: 4, background: 'var(--dm-border)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${100 - pct}%`,
              height: '100%',
              background: urgent ? 'var(--dm-error)' : 'var(--dm-gold)',
              transition: 'width 0.25s linear',
            }}
          />
        </div>

        <QuestionView q={cur} phase={curPhase} selectedId={selectedId} locked={!canAnswer} onSelect={select} />

        {error === 'answer' && (
          <p className="text-sm mt-2" style={{ color: 'var(--dm-error)' }}>
            {t('exam.answerFailed')}
          </p>
        )}

        <button
          type="button"
          disabled={!canAnswer || !selectedId}
          onClick={() => void goConfirm()}
          className="dm-press w-full rounded-2xl px-5 py-4 font-bold mt-4"
          style={{
            background: canAnswer && selectedId ? 'var(--dm-gold)' : 'var(--dm-card)',
            color: canAnswer && selectedId ? 'var(--dm-bg)' : 'var(--dm-text-muted)',
            border: canAnswer && selectedId ? 'none' : '1px solid var(--dm-border)',
          }}
        >
          {last ? t('exam.finish') : t('exam.confirm')} ➡️
        </button>
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
        <div className="fixed inset-0 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 50 }}>
          <div className="rounded-2xl p-5 w-full" style={{ ...card, maxWidth: 360 }}>
            <p className="font-bold mb-1" style={{ color: 'var(--dm-text)' }}>
              {t('exam.confirmTitle')}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--dm-text-muted)' }}>
              {t('exam.confirmText')}
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
                onClick={() => void finishNow()}
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
