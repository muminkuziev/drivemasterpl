---
name: drivemaster-conventions
description: DriveMaster AI loyihasining (Telegram bot + Mini App + NestJS API) dizayn tokenlari, sahifa qolipi, i18n, autentifikatsiya va backend modul konventsiyalari. Ushbu repoda (apps/webapp, apps/api) yangi sahifa, komponent, endpoint yoki modul yaratishda, yoki mavjud UI'ni o'zgartirishda ISHLATILSIN.
license: Internal use — DriveMaster loyihasiga tegishli, boshqa loyihalarga nusxalanmasin.
metadata:
  author: drivemaster
  scope: apps/webapp, apps/api
---

# DriveMaster konventsiyalari

Bu skill kodbazadan (2026-07-09 holatiga) to'g'ridan-to'g'ri chiqarib olingan
haqiqiy qarorlar to'plami — o'ylab topilgan "ideal" standart emas. Yangi kod
shu yerdagi naqshlarga mos kelishi kerak, aks holda ilova ichida vizual va
strukturaviy nomuvofiqlik paydo bo'ladi.

## 1. Rang tokenlari (dark navy + oltin)

Barcha ranglar inline `style={{...}}` orqali beriladi (Tailwind rang klassi
emas — bu loyihada ataylab shunday, chunki ranglar markaziy palitraga qat'iy
bog'langan). Yangi komponent yozganda **shu hex kodlardan tashqariga
chiqma**:

| Maqsad | Hex | Qayerda ishlatiladi |
|---|---|---|
| Ilova foni (root) | `#0b1220` | `telegram.ts`dagi `setBackgroundColor`, header/CTA fon |
| Karta/panel foni | `#1a2338` | Har bir `rounded-2xl` karta, header emas |
| Ichki/pastki fon (icon box, nav-item ichi) | `#141b2e` | Ikonka konteynerlari, ichki bo'linmalar |
| Bordur | `#2a3350` | `1px solid #2a3350` — deyarli barcha kartalarda |
| Asosiy matn | `#f5f7fa` | Sarlavhalar, asosiy matn |
| Ikkinchi darajali matn | `#9aa4bf` | Subtitle, izoh, yordamchi matn |
| Oltin urg'u (brand accent) | `#d4af37` | CTA tugmalar, chevron `›`, faol holat, premium belgisi |
| Ogohlantirish | `#f5a623` | Warning banner, eslatma matni |
| Xato/xavf | `#ef4444` | Xato holati, noto'g'ri javob (**`#e2574c` emas** — bu eski/nomuvofiq qiymat, ishlatilmasin) |
| Muvaffaqiyat | `#22c55e` | To'g'ri javob, muvaffaqiyatli holat |
| Ma'lumot (test ranglari) | `#3b82f6`, `#eab308`, `#a855f7` | Faqat psixologik test o'yinlarida (rang-mos o'yin uchun), umumiy UI'da ishlatilmaydi |
| O'chirilgan/muted | `#6b7690`, `#4a5372` | Disabled holat, ikkinchi darajali border |

## 2. Sahifa qolipi (har bir `pages/*.tsx` shu tuzilishda)

```tsx
export function PageName() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl px-1" style={{ color: '#f5f7fa' }}>
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          {emoji} {t('pageName.title')}
        </h1>
      </header>
      <div className="flex-1 px-4 pb-6 flex flex-col gap-4">
        {/* kontent */}
      </div>
    </div>
  );
}
```

- `MainMenu`/`Splash` kabi ildiz sahifalar bundan mustasno (orqaga tugmasi
  yo'q, `Logo` komponenti + boshqa header ishlatadi).
- Ro'yxat/menyu tugmasi naqshi (`MainMenu.tsx`, `DriverMenu.tsx`):
  48×48 `rounded-xl` ikonka qutisi (fon `#141b2e`) + bold sarlavha
  (`#f5f7fa`) + subtitle (`#9aa4bf`) + o'ng tomonda `›` (`#d4af37`).
- Foydalanuvchi amali (tugma bosish, navigatsiya)dan oldin/keyin
  `haptic('light')` chaqiriladi (`telegram.ts`dan).

## 3. i18n — uchta JSON fayl, dot-path kalitlar

- `apps/webapp/src/i18n/{uz,ru,en}.json` — **har uchalasida bir xil
  struktura**, `uz.json` — fallback (asosiy til).
- Yangi matn qo'shganda **uchala faylga ham** qo'shish shart, birontasini
  o'tkazib yubormaslik kerak.
- UI matni: `useTranslation()` dan `t('bo\'lim.kalit')`, interpolyatsiya
  `{{var}}` sintaksisi bilan (`t('key', { var: value })`).
- Bazadan keladigan ko'p tilli **kontent** (savol matni, belgi tavsifi —
  UI matni emas) uchun alohida `pickText(locale, {pl,uz,ru,en})` funksiyasi
  ishlatiladi (`LocaleContext.tsx`), fallback tartibi: tanlangan til → uz → pl.

## 4. Frontend ↔ backend aloqasi

- `apps/webapp/src/api.ts`da har bir domen uchun tipланган funksiya:
  `getJson<T>(path)` / `postJson<T>(path, body)` — ikkalasi ham
  `authHeaders()` orqali `X-Telegram-Init-Data` headerini avtomatik
  qo'shadi. Yangi endpoint qo'shganda shu ikki helper'dan foydalaning,
  to'g'ridan-to'g'ri `fetch` yozmang (agar maxsus ehtiyoj — masalan
  binary/base64 javob — bo'lmasa; bunday holat uchun `translateVoice`
  namunasiga qarang: maxsus xato turlarini ajratish kerak bo'lsa, shu
  fetch + custom Error subclass naqshini takrorlang).
- Backend'da har bir funksiya uchun **alohida `*-web.controller.ts`**
  (`apps/api/src/webapp/`), barchasi `@UseGuards(TelegramAuthGuard)`.
  Guard `x-telegram-init-data`ni HMAC bilan tekshiradi va
  `body.telegramId`/`query.telegramId`ni **serverda tasdiqlangan ID bilan
  qayta yozadi** — shuning uchun controller/service ichida
  `usersService.findOrCreateByTelegramId(telegramId)` chaqirilgandan keyin
  keladigan ID'ga ishonish mumkin, lekin mijoz yuborgan boshqa maydonlarga
  (masalan `isPremium`) hech qachon ishonmang — bazadan qayta o'qing.
- Har bir yangi domen (masalan `translator`) o'z modulida
  (`apps/api/src/<domain>/<domain>.module.ts` + `.service.ts`), so'ngra
  `webapp.module.ts`ga import qilinadi va mos `*-web.controller.ts`
  orqali ochiladi — controller ichida biznes-logika yozilmaydi, faqat
  validatsiya + service chaqiruv.

## 5. Prisma va env konventsiyalari

- Har bir model `@@map("snake_case_nomi")` bilan tugaydi.
- Nostandart/noaniq maydonlar ustida **o'zbekcha izoh** yoziladi (nima
  uchun kerakligini tushuntiruvchi, nima ekanini emas).
- `.env.example`dagi har bir o'zgaruvchi ustida o'zbekcha izoh bo'lishi
  shart (mavjud namunalar: `WEBAPP_URL`, `OPENAI_API_KEY`).
- `render.yaml`da maxfiy qiymatlar (token, kalit) doim `sync: false` —
  qiymat repo'da saqlanmaydi, Render dashboard'da qo'lda kiritiladi.
- Xarajat keltiruvchi tashqi API funksiyalari (masalan AI Tarjimon) uchun
  limit env var'lari orqali sozlanadi (`*_ENABLED`, `*_FREE_TOTAL_LIMIT`,
  `*_PREMIUM_DAILY_LIMIT`) — kod o'zgarishisiz favqulodda o'chirish
  imkoniyati doim bo'lishi kerak.

## 6. Mahsulot falsafasi (kod yozishda hisobga olinadi)

- **Lean scope:** real foydalanuvchi/to'lov trafigi yo'q bo'lsa, to'liq
  SaaS-darajadagi infratuzilma (rollar, 2FA, alohida admin panel)
  qurilmaydi. Oldin eng kichik ishlaydigan versiya, keyin kengaytirish.
- **Kontent huquqiy tozaligi:** kontent (savol, video, matn) manbasi
  taklif qilinganda avval "davlat/ochiq litsenziyami yoki tijorat
  mahsulotimi?" tekshiriladi. Tijorat/proprietary manbadan scraping
  qilish taqiqlanadi.
- **Bir martalik to'lov modeli:** premium — umrbod kirish, obuna emas.
  Shu sababli davomiy xarajat keltiruvchi funksiyalar (AI so'rovlar)
  har doim foydalanish limiti bilan qo'shiladi, "cheksiz" deb va'da
  berilmaydi.
