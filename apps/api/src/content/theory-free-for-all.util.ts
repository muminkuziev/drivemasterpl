/**
 * Vaqtincha o'chirish/yoqish tugmasi — mijoz bazasini yig'ish bosqichida
 * barcha teoriya kontenti (matn/rasm/video) hamma uchun bepul ochiladi,
 * premium tekshiruvi chetlab o'tiladi. `User.isPremium` bazadagi qiymati
 * o'zgarmaydi — faqat kontentga kirish tekshiruvi vaqtincha bypass qilinadi,
 * shuning uchun keyinchalik `THEORY_FREE_FOR_ALL=false` qilib qaytarish
 * hech qanday ma'lumot migratsiyasisiz mumkin.
 */
export function isTheoryFreeForAll(): boolean {
  return process.env.THEORY_FREE_FOR_ALL === 'true';
}
