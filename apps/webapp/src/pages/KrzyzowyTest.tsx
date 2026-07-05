import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiRoundAddRound, multiRoundFinish, multiRoundStart } from '../api';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
const TOTAL_ROUNDS = 8;
const ROUND_TIME_MS = 2200;

type Phase = 'idle' | 'active' | 'result';

interface Card {
  shape: (typeof SHAPES)[number];
  color: string;
}

function shapeStyle(shape: Card['shape'], color: string): React.CSSProperties {
  const base: React.CSSProperties = { width: 56, height: 56, background: color };
  switch (shape) {
    case 'circle':
      return { ...base, borderRadius: '50%' };
    case 'square':
      return { ...base, borderRadius: 8 };
    case 'diamond':
      return { ...base, borderRadius: 8, transform: 'rotate(45deg)' };
    case 'triangle':
      return {
        width: 0,
        height: 0,
        borderLeft: '28px solid transparent',
        borderRight: '28px solid transparent',
        borderBottom: `52px solid ${color}`,
        background: 'none',
      };
  }
}

function buildRound(): { target: string; cards: Card[] } {
  const target = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shuffledShapes = [...SHAPES].sort(() => Math.random() - 0.5);
  const others = COLORS.filter((c) => c !== target).sort(() => Math.random() - 0.5);
  const cards: Card[] = shuffledShapes.map((shape, i) => ({
    shape,
    color: i === 0 ? target : others[i - 1],
  }));
  return { target, cards: cards.sort(() => Math.random() - 0.5) };
}

export function KrzyzowyTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState('#ef4444');
  const [cards, setCards] = useState<Card[]>([]);
  const [progress, setProgress] = useState(100);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  async function begin() {
    setRound(0);
    setCorrectCount(0);
    setFinalScore(null);
    await multiRoundStart('krzyzowy', getTelegramId(), getDeviceId());
    nextRound(1);
  }

  function nextRound(roundNumber: number) {
    const r = buildRound();
    setTarget(r.target);
    setCards(r.cards);
    setRound(roundNumber);
    setPhase('active');
    setProgress(100);
    answeredRef.current = false;
    startedAtRef.current = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setProgress(Math.max(0, 100 - (elapsed / ROUND_TIME_MS) * 100));
    }, 50);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onAnswer(roundNumber, false, ROUND_TIME_MS), ROUND_TIME_MS);
  }

  async function onAnswer(roundNumber: number, isCorrect: boolean, reactionTimeMs: number) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    haptic(isCorrect ? 'light' : 'heavy');
    if (isCorrect) setCorrectCount((c) => c + 1);

    const telegramId = getTelegramId();
    await multiRoundAddRound('krzyzowy', telegramId, isCorrect, reactionTimeMs);

    if (roundNumber >= TOTAL_ROUNDS) {
      const res = await multiRoundFinish('krzyzowy', telegramId);
      setFinalScore(res.score);
      setPhase('result');
    } else {
      nextRound(roundNumber + 1);
    }
  }

  function onCardTap(card: Card) {
    if (phase !== 'active' || answeredRef.current) return;
    const reactionTimeMs = Date.now() - startedAtRef.current;
    void onAnswer(round, card.color === target, reactionTimeMs);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl px-1" style={{ color: '#f5f7fa' }}>
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          🧠 {t('krzyzowy.title')}
        </h1>
      </header>

      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <p className="text-center" style={{ color: '#9aa4bf' }}>
            {t('krzyzowy.instructions')}
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

      {phase === 'active' && (
        <div className="flex-1 flex flex-col px-6">
          <div className="flex justify-between text-sm mb-2" style={{ color: '#9aa4bf' }}>
            <span>{t('krzyzowy.round', { round, total: TOTAL_ROUNDS })}</span>
            <span>{t('krzyzowy.correct', { count: correctCount })}</span>
          </div>
          <div className="h-1.5 rounded-full mb-6" style={{ background: '#2a3350' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: '#d4af37', transition: 'width 50ms linear' }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm" style={{ color: '#9aa4bf' }}>
              {t('krzyzowy.findColor')}
            </span>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: target }} />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 place-items-center">
            {cards.map((card, i) => (
              <button key={i} type="button" onClick={() => onCardTap(card)} className="flex items-center justify-center">
                <div style={shapeStyle(card.shape, card.color)} />
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
              {t('krzyzowy.resultLabel', { correct: correctCount, total: TOTAL_ROUNDS })}
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
