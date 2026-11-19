import type { ReactNode, SVGProps } from 'react';

/**
 * Yagona uslubdagi stroke ikonkalar (emoji o'rniga). Tashqi kutubxona yo'q,
 * rang `currentColor` orqali beriladi.
 */
export type IconName =
  | 'book'
  | 'brain'
  | 'sign'
  | 'map'
  | 'pin'
  | 'car'
  | 'alert'
  | 'mic'
  | 'user'
  | 'chevron'
  | 'arrow'
  | 'home'
  | 'bars'
  | 'star'
  | 'bookmark'
  | 'back'
  | 'list'
  | 'warn';

const PATHS: Record<IconName, ReactNode> = {
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
      <path d="M9 8h7M9 12h5" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 3.5A3 3 0 0 0 6.6 6 3.2 3.2 0 0 0 4.5 9a3.1 3.1 0 0 0 1 2.3A3.3 3.3 0 0 0 5 13.5 3.2 3.2 0 0 0 7.2 16.6 3 3 0 0 0 12 19V5.5a2 2 0 0 0-2.5-2Z" />
      <path d="M14.5 3.5A3 3 0 0 1 17.4 6a3.2 3.2 0 0 1 2.1 3 3.1 3.1 0 0 1-1 2.3 3.3 3.3 0 0 1 .5 2.2 3.2 3.2 0 0 1-2.2 3.1A3 3 0 0 1 12 19" />
    </>
  ),
  sign: (
    <>
      <path d="M12 2.8 21.2 12 12 21.2 2.8 12 12 2.8Z" />
      <path d="M8.5 12h7M12.8 9.2 15.6 12l-2.8 2.8" />
    </>
  ),
  map: (
    <>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  car: (
    <>
      <path d="M4 15.5V12l2.1-5.2A2 2 0 0 1 8 5.5h8a2 2 0 0 1 1.9 1.3L20 12v3.5" />
      <path d="M3 12h18v5a1 1 0 0 1-1 1h-1.5M5.5 18H4a1 1 0 0 1-1-1v-5" />
      <circle cx="7.5" cy="15.5" r="1.1" />
      <circle cx="16.5" cy="15.5" r="1.1" />
      <path d="M8 18.5h8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.2 21.5 19.5a1 1 0 0 1-.9 1.5H3.4a1 1 0 0 1-.9-1.5L12 3.2Z" />
      <path d="M12 9.5v5M12 17.6v.1" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  chevron: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  list: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="3.5" />
      <path d="M8 9h.01M8 12.5h.01M8 16h.01M11.5 9H16M11.5 12.5H16M11.5 16H16" />
    </>
  ),
  warn: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4.5M12 17.4h.01" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.8V20h13V9.8M10 20v-5.5h4V20" />
    </>
  ),
  bars: <path d="M5.5 20v-6M12 20V5M18.5 20v-9" />,
  star: <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.2-4.1 5.8-.8L12 3.6Z" />,
  bookmark: <path d="M6.5 3.5h11v17L12 16.5l-5.5 4v-17Z" />,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
