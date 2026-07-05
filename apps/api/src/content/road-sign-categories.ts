export const ROAD_SIGN_CATEGORIES = [
  { key: 'warning', icon: '⚠️', label: "Ogohlantiruvchi belgilar (A-seriya)" },
  { key: 'prohibition', icon: '⛔', label: "Ta'qiqlovchi belgilar (B-seriya)" },
  { key: 'mandatory', icon: '🔵', label: 'Buyruq beruvchi belgilar (C-seriya)' },
  { key: 'information', icon: 'ℹ️', label: 'Axborot belgilar (D-seriya)' },
  { key: 'additional', icon: '➕', label: "Qo'shimcha belgilar (G-seriya)" },
  { key: 'direction', icon: '🧭', label: "Yo'nalish va shahar belgilar (E-seriya)" },
  { key: 'traffic_light', icon: '🚦', label: 'Svetofor signallari (S-seriya)' },
  { key: 'road_markings', icon: '🛣️', label: "Yo'l chiziqlari" },
  { key: 'traffic_controller', icon: '👮', label: 'Harakatni boshqaruvchi shaxs' },
  { key: 'dashboard', icon: '🚗', label: 'Mashina paneli indikatorlari' },
] as const;

export type RoadSignCategoryKey = (typeof ROAD_SIGN_CATEGORIES)[number]['key'];

export function isRoadSignCategoryKey(key: string): key is RoadSignCategoryKey {
  return ROAD_SIGN_CATEGORIES.some((c) => c.key === key);
}
