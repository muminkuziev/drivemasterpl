import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attentionClick, attentionFinish, attentionStart } from '../api';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const COLORS = [
  { key: 'red', hex: '#ef4444' },
  { key: 'green', hex: '#22c55e' },
  { key: 'blue', hex: '#3b82f6' },
  { key: 'yellow', hex: '#eab308' },
  { key: 'purple', hex: '#a855f7' },
] as const;

const DOT_COUNT = 20;

interface Dot {
  id: number;
  colorKey: string;
  tapped: boolean;
}

function buildDots(targetKey: string): Dot[] {
  const dots: Dot[] = [];
  const targetCount = 6;
  for (let i = 0; i < targetCount; i++) {
    dots.push({ id: i, colorKey: targetKey, tapped: false });
  }
  for (let i = targetCount; i < DOT_COUNT; i++) {
    const others = COLORS.filter((c) => c.key !== targetKey);
    const color = others[Math.floor(Math.random() * others.length)];
    dots.push({ id: i, colorKey: color.key, tapped: false });
  }
  return dots.sort(() => Math.random() - 0.5);
}

export function AttentionTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [target, setTarget] = useState<(typeof COLORS)[number] | null>(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const [result, setResult] = useState<{ accuracyPercent: number; mistakes: number } | null>(
    null,
  );
  const [remainingTargets, setRemainingTargets] = useState(0);

  useEffect(() => {
    void begin();
  }, []);

  async function begin() {
    setResult(null);
    const telegramId = getTelegramId();
    const deviceId = getDeviceId();
    await attentionStart(telegramId, deviceId);
    const chosen = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTarget(chosen);
    const newDots = buildDots(chosen.key);
    setDots(newDots);
    setRemainingTargets(newDots.filter((d) => d.colorKey === chosen.key).length);
  }

  async function onTapDot(dot: Dot) {
    if (dot.tapped || !target) return;
    const isCorrect = dot.colorKey === target.key;
    haptic(isCorrect ? 'light' : 'heavy');
    setDots((prev) => prev.map((d) => (d.id === dot.id ? { ...d, tapped: true } : d)));
    const telegramId = getTelegramId();
    await attentionClick(telegramId, isCorrect);
    if (isCorrect) {
      setRemainingTargets((prev) => {
        const next = prev - 1;
        if (next <= 0) void finish();
        return next;
      });
    }
  }

  async function finish() {
    const telegramId = getTelegramId();
    const res = await attentionFinish(telegramId);
    setResult(res);
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
          🔎 {t('attention.title')}
        </h1>
      </header>

      {!result && target && (
        <>
          <p className="text-center px-4 pb-3" style={{ color: 'var(--dm-text-muted)' }}>
            {t('attention.instructions', {
              color: t(`attention.color.${target.key}`),
              remaining: remainingTargets,
            })}
          </p>
          <div className="flex-1 grid grid-cols-4 gap-4 px-6 content-start pb-6">
            {dots.map((dot) => {
              const color = COLORS.find((c) => c.key === dot.colorKey)!;
              return (
                <button
                  key={dot.id}
                  type="button"
                  onClick={() => onTapDot(dot)}
                  disabled={dot.tapped}
                  className="aspect-square rounded-full transition-opacity"
                  style={{
                    background: color.hex,
                    opacity: dot.tapped ? 0.15 : 1,
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {result && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: 'var(--dm-gold)' }}>
              {Math.round(result.accuracyPercent)}%
            </p>
            <p className="text-sm" style={{ color: 'var(--dm-text-muted)' }}>
              {t('attention.resultLabel', { mistakes: result.mistakes })}
            </p>
          </div>
          <button
            type="button"
            onClick={begin}
            className="dm-press rounded-2xl px-8 py-4 font-bold"
            style={{ background: 'var(--dm-gold)', color: 'var(--dm-bg)' }}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
