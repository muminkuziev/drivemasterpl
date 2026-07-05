/**
 * Ko'rinadigan, oddiy watermark — ekranni yozib olishni to'xtatmaydi, lekin
 * agar kimdir yozib boshqalarga tarqatsa, kimning premium hisobidan
 * chiqqani ko'rinib turadi. Haqiqiy DRM emas, faqat izlanuvchan to'siq.
 */
interface WatermarkOverlayProps {
  label: string;
  dateLabel: string;
  warning: string;
  fullScreen?: boolean;
}

export function WatermarkOverlay({
  label,
  dateLabel,
  warning,
  fullScreen = false,
}: WatermarkOverlayProps) {
  const marks = Array.from({ length: fullScreen ? 24 : 12 }, (_, index) => index);

  return (
    <div
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: fullScreen ? 24 : 18,
        overflow: 'hidden',
        padding: fullScreen ? 20 : 16,
        zIndex: fullScreen ? 50 : undefined,
      }}
    >
      {marks.map((mark) => (
        <span
          key={mark}
          style={{
            alignSelf: 'center',
            justifySelf: 'center',
            color: 'rgba(255,255,255,0.44)',
            fontSize: fullScreen ? 12 : 14,
            fontWeight: 900,
            lineHeight: 1.2,
            transform: 'rotate(-24deg)',
            textShadow: '0 1px 6px rgba(0,0,0,0.85)',
            whiteSpace: 'normal',
            letterSpacing: 0,
            opacity: mark % 2 === 0 ? 1 : 0.72,
            textAlign: 'center',
            minWidth: fullScreen ? 180 : 150,
          }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>{label}</span>
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>{dateLabel}</span>
        </span>
      ))}
      {fullScreen && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: '42%',
            transform: 'translateY(-50%)',
            borderRadius: 14,
            border: '2px solid rgba(255,60,60,0.9)',
            background: 'rgba(0,0,0,0.62)',
            padding: '12px 14px',
            textAlign: 'center',
            boxShadow: '0 6px 22px rgba(0,0,0,0.55)',
          }}
        >
          <span
            style={{
              color: 'rgba(255,70,70,0.98)',
              fontSize: 16,
              fontWeight: 900,
              lineHeight: 1.25,
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              letterSpacing: 0,
            }}
          >
            {warning}
          </span>
        </div>
      )}
    </div>
  );
}
