interface LogoProps {
  size?: number;
}

export function Logo({ size = 96 }: LogoProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #141b2e, #0b1220)',
        border: '2px solid #d4af37',
        boxShadow: '0 0 24px rgba(212, 175, 55, 0.25)',
      }}
    >
      <span
        className="font-bold"
        style={{ fontSize: size * 0.34, color: '#d4af37', letterSpacing: -1 }}
      >
        DM
      </span>
    </div>
  );
}
