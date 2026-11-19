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
        background: 'linear-gradient(145deg, #3b7bff, #1239b8)',
        border: '2px solid rgba(255,255,255,0.65)',
        boxShadow: '0 10px 28px rgba(20, 60, 190, 0.35)',
      }}
    >
      <span
        className="font-bold"
        style={{ fontSize: size * 0.34, color: '#ffffff', letterSpacing: -1 }}
      >
        DM
      </span>
    </div>
  );
}
