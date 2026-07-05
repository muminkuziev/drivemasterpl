import type { ReactElement, ReactNode } from 'react';

const STROKE = '#f5f7fa';
const ACCENT = '#d4af37';

function Figure({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 200" width="100%" height="100%" style={{ maxWidth: 220 }}>
      {/* yer chizig'i */}
      <line x1="20" y1="185" x2="140" y2="185" stroke="#2a3350" strokeWidth="2" />
      {children}
    </svg>
  );
}

function Head({ cx = 80, cy = 40 }: { cx?: number; cy?: number }) {
  return <circle cx={cx} cy={cy} r="16" fill="none" stroke={STROKE} strokeWidth="4" />;
}

function Legs() {
  return (
    <>
      <line x1="80" y1="130" x2="62" y2="185" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="130" x2="98" y2="185" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

// TC-1: Yuqoriga ko'tarilgan qo'l — bitta qo'l tik yuqoriga
function ArmUpFigure() {
  return (
    <Figure>
      <Head />
      <line x1="80" y1="56" x2="80" y2="130" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
      <line x1="80" y1="70" x2="80" y2="10" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      <line x1="80" y1="80" x2="60" y2="115" stroke={STROKE} strokeWidth="7" strokeLinecap="round" />
      <Legs />
    </Figure>
  );
}

// TC-2: Yon tomoni bilan turgan — ingichka, yon profil, qo'llar old-orqaga cho'zilgan (chiziq bo'ylab)
function SidewaysFigure() {
  return (
    <Figure>
      <Head cx={80} cy={40} />
      <line x1="80" y1="56" x2="80" y2="130" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
      <line x1="30" y1="80" x2="130" y2="80" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      <Legs />
    </Figure>
  );
}

// TC-3: Old/orqa tomoni bilan turgan — keng, to'g'ridan ko'rinadi, qo'llar pastda
function FacingFigure() {
  return (
    <Figure>
      <Head />
      <line x1="80" y1="56" x2="80" y2="130" stroke={STROKE} strokeWidth="10" strokeLinecap="round" />
      <line x1="70" y1="70" x2="55" y2="120" stroke={STROKE} strokeWidth="7" strokeLinecap="round" />
      <line x1="90" y1="70" x2="105" y2="120" stroke={STROKE} strokeWidth="7" strokeLinecap="round" />
      <Legs />
    </Figure>
  );
}

// TC-4: Gorizontal cho'zilgan qo'l — ikkala qo'l yonlarga tekis cho'zilgan (T shakli)
function HorizontalArmsFigure() {
  return (
    <Figure>
      <Head />
      <line x1="80" y1="56" x2="80" y2="130" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
      <line x1="20" y1="75" x2="140" y2="75" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      <Legs />
    </Figure>
  );
}

const DIAGRAMS: Record<string, () => ReactElement> = {
  'TC-1': ArmUpFigure,
  'TC-2': SidewaysFigure,
  'TC-3': FacingFigure,
  'TC-4': HorizontalArmsFigure,
};

export function TrafficControllerDiagram({ code }: { code: string | null }) {
  const Diagram = (code && DIAGRAMS[code]) || FacingFigure;
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{ background: '#141b2e', padding: 12 }}
    >
      <Diagram />
    </div>
  );
}
