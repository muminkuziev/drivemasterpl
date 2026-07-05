import { join } from 'path';

/**
 * Production'da (masalan Render Persistent Disk) media papkasi kod bilan bir joyda
 * bo'lmasligi mumkin — shunday holatlarda MEDIA_ROOT env o'zgaruvchisi orqali
 * ko'rsatiladi. Lokal devda esa repo ichidagi apps/api/media ishlatiladi.
 */
export const MEDIA_ROOT_DIR = process.env.MEDIA_ROOT ?? join(__dirname, '..', '..', '..', 'media');
