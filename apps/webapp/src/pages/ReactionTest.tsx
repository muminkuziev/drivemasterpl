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
          ⚡ {t('reaction.title')}
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        {phase === 'idle' && (
          <>
            <p className="text-center" style={{ color: '#9aa4bf' }}>
              {t('reaction.instructions')}
            </p>
            <button
              type="button"
              onClick={start}
              className="rounded-2xl px-8 py-4 font-bold"
              style={{ background: '#d4af37', color: '#0b1220' }}
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
              background: phase === 'ready' ? '#22c55e' : '#1a2338',
              border: phase === 'ready' ? 'none' : '2px solid #2a3350',
              color: phase === 'ready' ? '#0b1220' : '#9aa4bf',
            }}
          >
            {phase === 'ready' ? t('reaction.pressNow') : t('common.waiting')}
          </button>
        )}

        {phase === 'too-early' && (
          <>
            <p className="text-center" style={{ color: '#ef4444' }}>
              {t('reaction.tooEarly')}
            </p>
            <button
              type="button"
              onClick={start}
              className="rounded-2xl px-8 py-4 font-bold"
              style={{ background: '#d4af37', color: '#0b1220' }}
            >
              {t('common.retry')}
            </button>
          </>
        )}

        {phase === 'result' && score !== null && (
          <>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#d4af37' }}>
                {Math.round(score)}
              </p>
              <p className="text-sm" style={{ color: '#9aa4bf' }}>
                {t('reaction.resultLabel', { ms: reactionMs ?? 0 })}
              </p>
            </div>
            <button
              type="button"
              onClick={start}
              className="rounded-2xl px-8 py-4 font-bold"
              style={{ background: '#d4af37', color: '#0b1220' }}
            >
              {t('common.tryAgain')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
