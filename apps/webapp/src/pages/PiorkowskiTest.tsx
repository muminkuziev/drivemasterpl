import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiRoundAddRound, multiRoundFinish, multiRoundStart } from '../api';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const ZONES = [
  { key: 'red', hex: '#ef4444', glow: 'rgba(239,68,68,0.55)' },
  { key: 'green', hex: '#22c55e', glow: 'rgba(34,197,94,0.55)' },
  { key: 'blue', hex: '#3b82f6', glow: 'rgba(59,130,246,0.55)' },
  { key: 'yellow', hex: '#eab308', glow: 'rgba(234,179,8,0.55)' },
];

const TOTAL_ROUNDS = 8;
const ROUND_TIMEOUT_MS = 1500;

type Phase = 'idle' | 'waiting' | 'active' | 'result';

export function PiorkowskiTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [avgMs, setAvgMs] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msSumRef = useRef(0);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  async function begin() {
    setRound(0);
    setAvgMs(0);
    setErrors(0);
    msSumRef.current = 0;
    setFinalScore(null);
    const telegramId = getTelegramId();
    await multiRoundStart('piorkowski', telegramId, getDeviceId());
    nextRound(1);
  }

  function nextRound(roundNumber: number) {
    setRound(roundNumber);
    setPhase('waiting');
    setActiveZone(null);
    const delay = 600 + Math.random() * 1600;
    timeoutRef.current = setTimeout(() => {
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      setActiveZone(zone.key);
      setPhase('active');
      startedAtRef.current = Date.now();
      timeoutRef.current = setTimeout(() => recordRound(roundNumber, false, ROUND_TIMEOUT_MS), ROUND_TIMEOUT_MS);
    }, delay);
  }

  async function recordRound(roundNumber: number, isCorrect: boolean, reactionTimeMs: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    haptic(isCorrect ? 'light' : 'heavy');
    const telegramId = getTelegramId();
    await multiRoundAddRound('piorkowski', telegramId, isCorrect, reactionTimeMs);
    msSumRef.current += reactionTimeMs;
    setAvgMs(Math.round(msSumRef.current / roundNumber));
    if (!isCorrect) setErrors((e) => e + 1);

    if (roundNumber >= TOTAL_ROUNDS) {
      const res = await multiRoundFinish('piorkowski', telegramId);
      setFinalScore(res.score);
      setPhase('result');
    } else {
      nextRound(roundNumber + 1);
    }
  }

  function onZoneTap(zoneKey: string) {
    if (phase !== 'active') return;
    const reactionTimeMs = Date.now() - startedAtRef.current;
    void recordRound(round, zoneKey === activeZone, reactionTimeMs);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl px-1" style={{ color: '#f5f7fa' }}>
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          🎯 {t('piorkowski.title')}
        </h1>
      </header>

      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <p className="text-center" style={{ color: '#9aa4bf' }}>
            {t('piorkowski.instructions', { rounds: TOTAL_ROUNDS })}
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
          <div className="flex justify-between text-sm mb-4" style={{ color: '#9aa4bf' }}>
            <span>{t('piorkowski.round', { round, total: TOTAL_ROUNDS })}</span>
            <span>{t('piorkowski.avg', { ms: avgMs })}</span>
            <span style={{ color: errors > 0 ? '#ef4444' : '#9aa4bf' }}>{t('piorkowski.errors', { count: errors })}</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {ZONES.map((zone) => {
              const isActive = phase === 'active' && activeZone === zone.key;
              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => onZoneTap(zone.key)}
                  className="rounded-2xl transition-all"
                  style={{
                    background: isActive ? zone.hex : '#1a2338',
                    boxShadow: isActive ? `0 0 30px ${zone.glow}` : 'none',
                    border: `2px solid ${isActive ? zone.hex : '#2a3350'}`,
                  }}
                />
              );
            })}
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
              {t('piorkowski.resultLabel', { ms: avgMs, errors })}
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
