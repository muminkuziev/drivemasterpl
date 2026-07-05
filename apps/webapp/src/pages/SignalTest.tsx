import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiRoundAddRound, multiRoundFinish, multiRoundStart } from '../api';
import { playBeep } from '../beep';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const SIGNALS = [
  { key: 'red', hex: '#ef4444' },
  { key: 'yellow', hex: '#eab308' },
  { key: 'green', hex: '#22c55e' },
  { key: 'sound', hex: '#a855f7' },
] as const;

const TOTAL_ROUNDS = 10;
const START_TIME_MS = 1800;
const TIME_STEP_MS = 120;
const MIN_TIME_MS = 650;

type Phase = 'idle' | 'waiting' | 'active' | 'result';

export function SignalTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [signal, setSignal] = useState<(typeof SIGNALS)[number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answeredRef = useRef(false);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
    },
    [],
  );

  async function begin() {
    setRound(0);
    setErrors(0);
    setFinalScore(null);
    await multiRoundStart('signal', getTelegramId(), getDeviceId());
    nextRound(1);
  }

  function timeLimitFor(roundNumber: number) {
    return Math.max(MIN_TIME_MS, START_TIME_MS - (roundNumber - 1) * TIME_STEP_MS);
  }

  function nextRound(roundNumber: number) {
    setRound(roundNumber);
    setPhase('waiting');
    setSignal(null);
    answeredRef.current = false;
    const delay = 500 + Math.random() * 1200;
    delayRef.current = setTimeout(() => {
      const s = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
      setSignal(s);
      setPhase('active');
      if (s.key === 'sound') playBeep();
      startedAtRef.current = Date.now();
      const limit = timeLimitFor(roundNumber);
      timeoutRef.current = setTimeout(() => onAnswer(roundNumber, s, null, limit), limit);
    }, delay);
  }

  async function onAnswer(
    roundNumber: number,
    activeSignal: (typeof SIGNALS)[number],
    pressedKey: string | null,
    reactionTimeMs: number,
  ) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const isCorrect = pressedKey === activeSignal.key;
    haptic(isCorrect ? 'light' : 'heavy');
    if (!isCorrect) setErrors((e) => e + 1);

    const telegramId = getTelegramId();
    await multiRoundAddRound('signal', telegramId, isCorrect, reactionTimeMs);

    if (roundNumber >= TOTAL_ROUNDS) {
      const res = await multiRoundFinish('signal', telegramId);
      setFinalScore(res.score);
      setPhase('result');
    } else {
      nextRound(roundNumber + 1);
    }
  }

  function onPress(key: string) {
    if (phase !== 'active' || !signal || answeredRef.current) return;
    const reactionTimeMs = Date.now() - startedAtRef.current;
    void onAnswer(round, signal, key, reactionTimeMs);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl px-1" style={{ color: '#f5f7fa' }}>
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          🚨 {t('signal.title')}
        </h1>
      </header>

      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <p className="text-center" style={{ color: '#9aa4bf' }}>
            {t('signal.instructions')}
          </p>
          <button
            type="button"
            onClick={begin}
            className="rounded-2xl px-8 py-4 font-bold"
            style={{ background: '#d4af37', color: '#0b1220' }}
          >
            {t('common.start')}
          </button>
        </div>
      )}

      {(phase === 'waiting' || phase === 'active') && (
        <div className="flex-1 flex flex-col px-6">
          <div className="flex justify-between text-sm mb-6" style={{ color: '#9aa4bf' }}>
            <span>{t('signal.round', { round, total: TOTAL_ROUNDS })}</span>
            <span>{t('signal.time', { ms: timeLimitFor(round) })}</span>
            <span style={{ color: errors > 0 ? '#ef4444' : '#9aa4bf' }}>{t('signal.errors', { count: errors })}</span>
          </div>

          <div
            className="flex-1 flex items-center justify-center rounded-2xl mb-6"
            style={{
              background: '#1a2338',
              border: '2px solid #2a3350',
              minHeight: 140,
            }}
          >
            {phase === 'active' && signal ? (
              signal.key === 'sound' ? (
                <span style={{ fontSize: 48 }}>🔊</span>
              ) : (
                <div
                  className="rounded-full"
                  style={{
                    width: 90,
                    height: 90,
                    background: signal.hex,
                    boxShadow: `0 0 40px ${signal.hex}`,
                  }}
                />
              )
            ) : (
              <span style={{ color: '#9aa4bf' }}>{t('common.waiting')}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SIGNALS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onPress(s.key)}
                className="rounded-xl px-4 py-3 font-semibold"
                style={{ background: '#1a2338', border: `2px solid ${s.hex}`, color: s.hex }}
              >
                {t(`signal.color.${s.key}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && finalScore !== null && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#d4af37' }}>
              {Math.round(finalScore)}
            </p>
            <p className="text-sm" style={{ color: '#9aa4bf' }}>
              {t('signal.resultLabel', { errors })}
            </p>
          </div>
          <button
            type="button"
            onClick={begin}
            className="rounded-2xl px-8 py-4 font-bold"
            style={{ background: '#d4af37', color: '#0b1220' }}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
