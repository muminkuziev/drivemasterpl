import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coordinationFinish, coordinationMove, coordinationStart } from '../api';
import { getDeviceId, getTelegramId, haptic } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';

const PATHS: Record<number, string> = {
  1: 'M 20 150 Q 100 40, 150 150 T 280 150',
  2: 'M 20 40 C 100 280, 200 20, 280 260',
  3: 'M 20 260 Q 150 20, 280 260',
  4: 'M 20 60 C 60 260, 240 60, 280 260',
  5: 'M 20 150 C 90 20, 210 280, 280 150',
};

const TOLERANCE = 22;
const MOVE_REPORT_MS = 180;

export function CoordinationTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastReportRef = useRef(0);
  const draggingRef = useRef(false);

  const [pathD, setPathD] = useState<string | null>(null);
  const [dot, setDot] = useState({ x: 20, y: 150 });
  const [onTrack, setOnTrack] = useState(true);
  const [result, setResult] = useState<{ coordinationScore: number; outOfLineTime: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    void begin();
  }, []);

  async function begin() {
    setResult(null);
    const telegramId = getTelegramId();
    const deviceId = getDeviceId();
    const { pathId } = await coordinationStart(telegramId, deviceId);
    const d = PATHS[pathId] ?? PATHS[1];
    setPathD(d);
    setOnTrack(true);
    requestAnimationFrame(() => {
      const start = pathRef.current?.getPointAtLength(0);
      if (start) setDot({ x: start.x, y: start.y });
    });
  }

  function toSvgPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function distanceToPath(x: number, y: number): number {
    const path = pathRef.current;
    if (!path) return 0;
    const total = path.getTotalLength();
    const samples = 60;
    let min = Infinity;
    for (let i = 0; i <= samples; i++) {
      const p = path.getPointAtLength((total * i) / samples);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < min) min = d;
    }
    return min;
  }

  function handlePointerMove(clientX: number, clientY: number) {
    if (!draggingRef.current) return;
    const p = toSvgPoint(clientX, clientY);
    if (!p) return;
    setDot({ x: p.x, y: p.y });
    const dist = distanceToPath(p.x, p.y);
    const isOnTrack = dist <= TOLERANCE;
    setOnTrack(isOnTrack);
    if (!isOnTrack) haptic('light');

    const now = Date.now();
    if (now - lastReportRef.current > MOVE_REPORT_MS) {
      lastReportRef.current = now;
      const telegramId = getTelegramId();
      void coordinationMove(telegramId, !isOnTrack);
    }
  }

  async function handlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const telegramId = getTelegramId();
    const res = await coordinationFinish(telegramId);
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
          🧩 {t('coordination.title')}
        </h1>
      </header>

      {!result && (
        <>
          <p className="text-center px-4 pb-2" style={{ color: 'var(--dm-text-muted)' }}>
            {t('coordination.instructions')}
          </p>
          <div className="flex-1 flex items-center justify-center px-4">
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              className="w-full max-w-sm rounded-2xl"
              style={{ background: 'var(--dm-bg-elevated)', touchAction: 'none' }}
              onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {pathD && (
                <path
                  ref={pathRef}
                  d={pathD}
                  stroke="var(--dm-border)"
                  strokeWidth={TOLERANCE * 2}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {pathD && (
                <path d={pathD} stroke="var(--dm-gold)" strokeWidth={2} fill="none" opacity={0.6} />
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={14}
                fill={onTrack ? 'var(--dm-success)' : 'var(--dm-error)'}
                stroke="var(--dm-bg)"
                strokeWidth={2}
                onPointerDown={() => {
                  draggingRef.current = true;
                  setDragging(true);
                }}
                style={{ cursor: 'grab' }}
              />
            </svg>
          </div>
          <p className="text-center pb-6 text-sm" style={{ color: 'var(--dm-text-muted)' }}>
            {dragging ? t('coordination.dragging') : t('coordination.dragHint')}
          </p>
        </>
      )}

      {result && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: 'var(--dm-gold)' }}>
              {Math.round(result.coordinationScore)}
            </p>
            <p className="text-sm" style={{ color: 'var(--dm-text-muted)' }}>
              {t('coordination.resultLabel', { seconds: result.outOfLineTime.toFixed(1) })}
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
