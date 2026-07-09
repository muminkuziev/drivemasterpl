import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reactionResult, reactionStart } from '../api';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

type Phase = 'idle' | 'waiting' | 'ready' | 'too-early' | 'result';

export function ReactionTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const readyAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function start() {
    setPhase('waiting');
    const telegramId = getTelegramId();
    const deviceId = getDeviceId();
    const { delay } = await reactionStart(telegramId, deviceId);
    timerRef.current = setTimeout(() => {
      readyAtRef.current = Date.now();
      setPhase('ready');
    }, delay);
  }

  async function onTap() {
    if (phase === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      haptic('medium');
      setPhase('too-early');
      return;
    }
    if (phase !== 'ready' || !readyAtRef.current) return;
    haptic('light');
    const ms = Date.now() - readyAtRef.current;
    setReactionMs(ms);
    const telegramId = getTelegramId();
    const deviceId = getDeviceId();
    const res = await reactionResult(telegramId, ms, deviceId);
    setScore(res.score);
    setPhase('result');
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
          ⚡ {t('reaction.title')}
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        {phase === 'idle' && (
          <>
            <p className="text-center" style={{ color: 'var(--dm-text-muted)' }}>
              {t('reaction.instructions')}
            </p>
            <button
              type="button"
              onClick={start}
              className="dm-press rounded-2xl px-8 py-4 font-bold"
              style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
            >
              {t('common.start')}
            </button>
          </>
        )}

        {(phase === 'waiting' || phase === 'ready') && (
          <button
            type="button"
            onClick={onTap}
            className="w-48 h-48 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
            style={{
              background: phase === 'ready' ? 'var(--dm-success)' : 'var(--dm-card)',
              border: phase === 'ready' ? 'none' : '2px solid var(--dm-border)',
              color: phase === 'ready' ? 'var(--dm-bg)' : 'var(--dm-text-muted)',
            }}
          >
            {phase === 'ready' ? t('reaction.pressNow') : t('common.waiting')}
          </button>
        )}

        {phase === 'too-early' && (
          <>
            <p className="text-center" style={{ color: 'var(--dm-error)' }}>
              {t('reaction.tooEarly')}
            </p>
            <button
              type="button"
              onClick={start}
              className="dm-press rounded-2xl px-8 py-4 font-bold"
              style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
            >
              {t('common.retry')}
            </button>
          </>
        )}

        {phase === 'result' && score !== null && (
          <>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: 'var(--dm-gold)' }}>
                {Math.round(score)}
              </p>
              <p className="text-sm" style={{ color: 'var(--dm-text-muted)' }}>
                {t('reaction.resultLabel', { ms: reactionMs ?? 0 })}
              </p>
            </div>
            <button
              type="button"
              onClick={start}
              className="dm-press rounded-2xl px-8 py-4 font-bold"
              style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
            >
              {t('common.tryAgain')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
