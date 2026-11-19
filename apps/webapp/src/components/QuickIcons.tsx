/** Tezkor yorliqlar uchun hajmli glyphlar (gradient tile ichida ko'rsatiladi) */
export type QuickKey = 'tests' | 'signs' | 'lessons' | 'videos';

const GLYPHS: Record<QuickKey, React.JSX.Element> = {
  tests: <><rect x="8" y="6.5" width="24" height="29" rx="4" fill="#fff8ee" stroke="#d9a35f" strokeWidth="2"/><rect x="14" y="3" width="12" height="7" rx="3" fill="#c98a4b"/><path d="m12 17.5 2 2 3.6-4.2" stroke="#1d6bff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="m12 25 2 2 3.6-4.2M12 32.5l2 2 3.6-4.2" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M21 17h7M21 24.5h7M21 32h7" stroke="#9aa7bd" strokeWidth="2.2" strokeLinecap="round"/></>,
  signs: <><path d="M6.5 9.5h27L20 33 6.5 9.5Z" fill="#fff" stroke="#e11d3a" strokeWidth="5.2" strokeLinejoin="round"/></>,
  lessons: <><path d="M20 11.5c-4-3-9-3.6-14-2.6v20.5c5-1 10-.4 14 2.6 4-3 9-3.6 14-2.6V8.9c-5-1-10-.4-14 2.6Z" fill="#fff"/><path d="M9 15.5h8M9 19.5h8M9 23.5h8M23 15.5h8M23 19.5h8M23 23.5h8" stroke="#b9cfc2" strokeWidth="1.8" strokeLinecap="round"/><path d="M20 11.5v20.5" stroke="#2aa862" strokeWidth="1.8"/><path d="M6 29.4c5-1 10-.4 14 2.6 4-3 9-3.6 14-2.6" stroke="#0f8a45" strokeWidth="2.6" strokeLinecap="round" fill="none"/></>,
  videos: <><rect x="6" y="16.5" width="28" height="18" rx="3.5" fill="#243459"/><path d="m6 13 1.8-5.2 26.4 4.4-.9 4.8H6Z" fill="#fff"/><path d="m11 8.7 4.6.8-2.8 4H8.2Zm9.4 1.6 4.6.8-2.8 4h-4.6Zm9.4 1.6 3.6.6-.6 3.4h-5.8Z" fill="#e8383d"/><path d="m16.5 21 9 5-9 5v-10Z" fill="#fff"/></>,
};

export function QuickGlyph({ name }: { name: QuickKey }) {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  );
}
