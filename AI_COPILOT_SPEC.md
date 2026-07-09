# AI Yordamchi (AI Copilot) — to'liq spec

Status: **spec/roadmap, implementatsiya boshlanmagan.** Maqsad — DriveMaster'ni
bir martalik "imtihonga tayyorgarlik" mahsulotidan haydovchi kundalik ochadigan
doimiy yordamchiga aylantirish. Foydalanuvchi taklif qilgan 12 funksiya shu
yerda texnik jihatdan baholanadi, bosqichlarga bo'linadi va har biri uchun
aniq blocker/yechim ko'rsatiladi.

**Joriy stack (2026-07-09 holatiga ko'ra):** Telegram bot (Telegraf) + React
Mini App (webview, faqat foreground'da ochiq turganda ishlaydi, background
xizmat yo'q) + NestJS API + Prisma/Postgres. Native mobil ilova **yo'q**.
To'lov modeli — bir martalik (umrbod), obuna emas. Batafsil: `[[project-drivemaster-overview]]`.

---

## 0. Eng muhim strukturaviy cheklov

Telegram Mini App — bu webview, native ilova emas. Bu shuni anglatadi:

- **Background GPS tracking mumkin emas.** Brauzer Geolocation API faqat
  foydalanuvchi ilovani ochiq ushlab turgan paytda ishlaydi. Ilova yopilishi
  bilan (yoki telefon ekrani o'chishi bilan) trek to'xtaydi. "Kun davomida
  avtomatik 186 km yozib borish" — bu faqat **native ilova** (background
  location permission bilan) orqali mumkin.
- **Accelerometer-based xavfsizlik tahlili** (keskin tormoz/tezlanish) ham
  native sensordan uzluksiz o'qishni talab qiladi — webview'da yo'q.
- Demak, **2, 6, 7, 11-funksiyalarning "to'liq/wow" versiyasi** (avtomatik,
  butun kun, background) — bu **Phase C: native mobil ilova** talab qiladi,
  hozir mavjud emas va alohida katta loyiha.
- Shu funksiyalarning **lean/manual versiyasi** (foydalanuvchi "Trip'ni
  boshlash/tugatish" tugmasini bosadi, ilova ochiq turganda GPS yozadi) —
  Mini App'da hozir ham qurish mumkin (Phase B), lekin "avtomatik kuzatuv"
  emas, balki "qo'lda ishga tushiriladigan trip logger".

Shu sababli quyida har bir funksiya **Phase A (hozir, bot/webapp)**, **Phase B
(hozir, lekin foreground-only trip logger kerak)** yoki **Phase C (native
ilova kerak)** deb belgilanadi.

---

## 1. Funksiya-ma-funksiya baho

| # | Funksiya | Blocker | Bosqich |
|---|---|---|---|
| 1 | AI Tarjimon (ovozli) | Yo'q — Telegram bot ovozli xabarlarni qabul qiladi/yuboradi | **Phase A** |
| 12 | AI Taxi Expert (matnli Q&A) | Yo'q — LLM + domain guardrail | **Phase A** |
| 9 | AI Document Assistant | Yo'q — data entry + cron eslatma | **Phase A** |
| 8 | AI Car Assistant | Yo'q — data entry + cron eslatma | **Phase A** |
| 3 | AI Earnings Analytics | Bolt/Uber/FreeNow'da uchinchi tomon uchun ochiq daromad API'si yo'q. Faqat qo'lda kiritish (yoki skrinshot OCR) mumkin — "scraping" qilib ulanish **taqiqlanadi** (ToS/huquqiy xavf, `[[feedback-legal-content-risk]]`bilan bir xil turkum) | **Phase B** (qo'lda kiritish bilan) |
| 2 | AI Driving Analytics | Background GPS yo'q → faqat foreground trip-logger | **Phase B** (lean) → **Phase C** (to'liq avtomatik) |
| 7 | AI Fuel Analytics | Yoqilg'i sarfini avtomatik o'lchaydigan sensor yo'q → qo'lda kiritish yoki km-ga asoslangan taxmin | **Phase B** |
| 6 | AI Driving Safety | Accelerometer background'da yo'q | **Phase C** |
| 11 | AI Daily Report | 2/3/6/7 dan yig'iladi — ularning eng zaif (Phase C) qismiga bog'liq, lekin Phase B ma'lumotlari bilan ham "kunlik xulosa" qisqartirilgan versiyada chiqarish mumkin | **Phase B (qisqartirilgan)** → **Phase C (to'liq)** |
| 5 | AI Traffic | Real vaqt tirbandlik/yopiq yo'l — faqat pullik xarita API (Google/HERE/TomTom) orqali, foydalanish-asosli xarajat | **Phase B** (agar byudjet ajratilsa) |
| 4 | AI Hot Zone | **Haqiqiy talab ma'lumoti yo'q.** Bolt/Uber ichki demand-heatmap'iga uchinchi tomon kira olmaydi. Aeroport/stadion kabi statik joylar uchun taxminiy qoida yozish mumkin, lekin bu "AI bashorati" emas, balki qattiq kodlangan evristika — foydalanuvchiga shunday deb aytilishi kerak | **Past ustuvorlik / soxta-hissiyot xavfi bor** |
| 10 | AI Voice Assistant | Mustaqil funksiya emas — 2/3/8/9/12 ustiga ovozli input/output qatlami | Har bir asosiy funksiya qurilgach qo'shiladi |

**Xulosa:** 1, 12, 9, 8 — hech qanday yangi infratuzilmasiz, hozir spec
qilinadigan va qurilishi mumkin bo'lgan yagona to'rttalik. Qolganlari yoki
qo'lda-kiritish bilan cheklangan (3, 7), yoki pullik tashqi API (5), yoki
native ilovani talab qiladi (2/6/11 to'liq versiyasi), yoki umuman ishonchli
ma'lumot manbai yo'q (4).

---

## 2. Cross-cutting: AI domain-guardrail dizayni

Foydalanuvchining o'zi taklif qilgan yondashuv to'g'ri — AI faqat quyidagi
5 domenga javob berishi kerak: 🚖 Taxi, 🚗 Haydash, 🗣 Tarjimon, 📊 Analytics,
📄 Hujjatlar.

**Ikki qatlamli filtr (xarajatni kamaytirish uchun):**

1. **Tez, arzon pre-filter** (kalit so'z/embedding-similarity yoki kichik/arzon
   model bilan tasnif) — agar so'rov aniq domendan tashqari bo'lsa (masalan
   "Bitcoin narxi", "Python yoz"), katta LLM'ga umuman so'rov yubormasdan
   darhol standart javob qaytariladi:
   > "AI Yordamchi faqat DriveMaster AI funksiyalari — haydash, taksi,
   > tarjima va statistikalar bo'yicha yordam beradi."
2. **System prompt guardrail** — agar pre-filter noaniq bo'lsa, asosiy LLM
   chaqiriladi, lekin system prompt'da qat'iy domen cheklovi va "agar savol
   domendan tashqari bo'lsa, rad et" ko'rsatmasi bo'ladi (ikkinchi himoya
   qatlami, pre-filter xato o'tkazib yuborgan hollar uchun).

**Monetizatsiya bilan bog'liqlik (muhim, hozirgi modelga zid):** hozirgi
premium — **bir martalik to'lov, umrbod kirish**. LLM/ovoz API'lari esa
har bir so'rov uchun xarajat keltiradi. Cheksiz AI so'rov + bir martalik
to'lov = vaqt o'tishi bilan zarar qiluvchi model. Tavsiya:
- Oylik AI so'rov limiti (masalan bepul foydalanuvchiga N ta/oy, premium'ga
  ko'proq, lekin baribir cheklangan) — yoki
- AI Yordamchi alohida mikro-to'lov/kredit tizimi bilan (asosiy premium'dan
  ajratilgan) — bu katta biznes-model qarori, implementatsiyadan oldin
  alohida muhokama qilinishi kerak.

---

## 3. Phase A — hozir spec qilinadigan funksiyalar (yangi infratuzilmasiz)

### 3.1 AI Taxi Expert (matnli Q&A) — #12

- **Nima:** foydalanuvchi erkin matn yozadi ("Pravam qachon tugaydi?",
  "Mijoz bilan qanday gaplashaman?"), AI domenga cheklangan javob beradi.
- **Ma'lumot manbai:** aralash — (a) DriveMaster'ning o'z bazasi (TheoryQuestion,
  RoadSign, foydalanuvchining hujjat muddatlari — pastga qarang) ustidan RAG,
  (b) umumiy bilim (Polsha yo'l harakati qoidalari, taksi ish tartibi) uchun
  LLM'ning o'z bilimi + system prompt.
- **Nega RAG kerak:** huquqiy/imtihon savollarida LLM "gallyutsinatsiya"
  xavfi bor — DriveMaster'ning o'z tasdiqlangan 181 (keyinchalik 2138)
  savolidan foydalanish javob aniqligini oshiradi.
- **Yangi Prisma modeli:** kerak emas (mavjud TheoryQuestion/RoadSign'dan
  o'qiladi), faqat suhbat tarixini saqlash uchun ixtiyoriy `AiChatMessage`
  (userId, role, content, createdAt) — token-limit uchun oxirgi N xabar.
- **API:** `POST /webapp/ai/chat` (Telegram initData auth bilan, mavjud
  `telegram-auth.guard.ts` naqshi bo'yicha) → LLM chaqiradi → domain-guardrail
  → javob.
- **Bot tomonda:** `/start` menyusida yangi tugma yoki Mini App ichida
  alohida "AI Yordamchi" bo'limi (DriverMenu.tsx'ga qo'shiladi).

### 3.2 AI Document Assistant — #9

- **Nima:** prava, sug'urta, litsenziya, texnik ko'rik muddatlarini kuzatib,
  muddat yaqinlashganda eslatma yuboradi.
- **Yangi Prisma modeli:** `UserDocument { id, userId, type (DRIVING_LICENSE|
  INSURANCE|LICENSE|TECH_INSPECTION), expiresAt, createdAt }`.
- **API:** CRUD endpointlar (`/webapp/documents`), Mini App'da forma.
- **Eslatma:** kunlik cron job (NestJS `@nestjs/schedule`, loyihada hali
  ishlatilmagan — qo'shiladi) — muddatga N kun qolganda Telegram orqali xabar
  (botning o'zi push qiladi, `ctx.telegram.sendMessage`).
- **AI qismi:** minimal — asosan CRUD + eslatma. "AI" degani shu yerda
  ko'proq "aqlli eslatma" (masalan "sizga 5 kun qoldi, hozir yangilashni
  unutmang" kabi tabiiy tilga o'ralgan xabar).

### 3.3 AI Car Assistant — #8

- Xuddi 9-bandga o'xshash: `CarMaintenance { id, userId, type (OIL|BRAKE_PADS|
  TECH_INSPECTION|INSURANCE), lastServiceAt yoki dueAt, notes }`.
- Amalda 9 va 8-bandni **bitta "Eslatmalar" modulida** birlashtirish mantiqan
  — ikkalasi ham bir xil pattern (muddat + eslatma), alohida sahifa/tugma
  bo'lishi mumkin, lekin backend'da bitta umumiy `Reminder` jadvali orqali
  qurilsa kodni takrorlamaydi.

### 3.4 AI Tarjimon (ovozli) — #1

- **Nima (Phase A doirasida realistik qismi):** haydovchi Telegram botga
  ovozli xabar yuboradi → bot tilni avtomatik aniqlaydi → tarjima qiladi →
  ovozli javob qaytaradi. **"Taxi Conversation Mode"ning to'liq versiyasi**
  (ikki tomon ketma-ket, uzluksiz suhbat, past latency) — murakkabroq UX,
  lekin asosiy pipeline bir xil, faqat push-to-talk urnida davomiy bo'ladi.
- **Pipeline:** Telegram voice (.ogg) → Speech-to-Text (masalan Whisper
  API yoki shunga o'xshash) → til aniqlash → tarjima (LLM yoki tarjima API)
  → Text-to-Speech → Telegram'ga voice sifatida yuborish.
- **Xarajat ogohlantirishi:** bu eng xarajatli funksiya (STT+TTS+LLM har bir
  gap uchun). Boshida faqat premium foydalanuvchilarga va/yoki kunlik limit
  bilan chiqarish tavsiya etiladi.
- **MVP qisqartirish:** avval faqat **matnli tarjima** (ovozsiz, faqat matn
  kiritib-matn olish) — TTS/STT'siz, ancha arzon va tez qurilishi mumkin,
  keyin ovozni qo'shish alohida bosqich sifatida.

---

## 4. Phase B — foreground/qo'lda kiritish bilan (native ilovasiz, lekin Mini App'da yangi UX)

### 4.1 Trip Logger (2 va 11-bandning lean versiyasi)

- Foydalanuvchi Mini App'ni ochib "Safarni boshlash" tugmasini bosadi →
  brauzer Geolocation API orqali GPS nuqtalari yig'iladi (faqat ilova ochiq
  turganda) → "Safarni tugatish" bosilganda masofa/vaqt/marshrut hisoblanadi.
- **Cheklov foydalanuvchiga aniq ko'rsatilishi kerak:** "ilova fonda
  yopilsa, kuzatuv to'xtaydi" — kutilmagan/chalkash UX'dan qochish uchun.
- Yangi Prisma modeli: `Trip { id, userId, startedAt, endedAt, distanceKm,
  routePoints (JSON yoki alohida jadval), avgSpeedKmh, maxSpeedKmh }`.

### 4.2 Earnings — qo'lda kiritish (3-band)

- Foydalanuvchi kun oxirida daromad/xarajat raqamlarini qo'lda kiritadi
  (yoki platformadan skrinshot yuboradi — OCR bilan raqam ajratib olish
  ixtiyoriy keyingi qadam, MVP'da shart emas).
- `Earning { id, userId, date, grossAmount, expenses, netAmount, hoursWorked }`.
- **Bolt/Uber bilan avtomatik integratsiya/scraping qilinmaydi** — ToS va
  huquqiy xavf sababli (`[[feedback-legal-content-risk]]`).

### 4.3 Fuel — qo'lda kiritish (7-band)

- `FuelLog { id, userId, date, liters, cost, odometerKm }` — shundan
  o'rtacha sarf/xarajat hisoblanadi, "eng tejamkor marshrut" degani esa
  real vaqt xarita API'siz aniq bo'lmaydi — shu qism Phase B'dan chiqarilib,
  faqat xarajat/sarf statistikasi qoldiriladi.

---

## 5. Phase C — native mobil ilova talab qiladigan qism

- Background GPS trip-tracking (2, 11-to'liq versiya)
- Accelerometer-based xavfsizlik tahlili (6)
- Bu **alohida katta loyiha** — iOS/Android native (yoki React Native/Flutter),
  location permission oqimi, batareya optimallashtirish, GDPR-muvofiq
  saqlash siyosati. `[[project-drivemaster-overview]]`da allaqachon "mobil
  ilova — keyingi bosqich" deb belgilangan qarorga mos keladi — bu funksiyalar
  o'sha bosqichga bog'lanadi, undan oldin boshlanmaydi.

---

## 6. Qurilmaydigan/qayta ko'rib chiqiladigan qism

- **AI Hot Zone (#4):** haqiqiy demand-ma'lumot manbai yo'qligi sababli,
  "AI aeroportda talab oshmoqda" kabi jumlalar aslida qattiq kodlangan
  qoida bo'ladi ("ertalab 6-9 aeroport yo'nalishi", "stadion tugash vaqti —
  statik jadval"), AI bashorati emas. Agar shunday qilinsa, foydalanuvchiga
  "taxminiy qoida" ekani ochiq aytilishi kerak — "AI bilim" sifatida
  taqdim etish ishonchni yo'qotish xavfini keltiradi.
- **AI Traffic (#5):** faqat tashqi pullik xarita API (Google Maps/HERE/
  TomTom) orqali mumkin — foydalanish-asosli xarajat, hozircha byudjet
  ajratilmagan bo'lsa keyinga qoldiriladi.

---

## 7. Tavsiya etilgan qurish tartibi

1. **AI Taxi Expert (matnli, RAG'siz, faqat system-prompt guardrail)** — eng
   tez, eng kam infratuzilma, domain-scoping'ni sinab ko'rish uchun ham
   yaxshi poligon.
2. **Reminders modul** (Document + Car Assistant birlashtirilgan) — sof
   CRUD + cron, AI deyarli kerak emas, lekin foydalanuvchiga kundalik qaytish
   sababini beradi.
3. **AI Tarjimon — faqat matn** (ovozsiz MVP), keyin ovoz (STT/TTS) qo'shiladi.
4. **Monetizatsiya qarori** (AI so'rov limiti/kredit) — 3-band ovozli qismidan
   oldin **albatta** hal qilinishi kerak, aks holda xarajat nazoratsiz o'sadi.
5. **Trip Logger (lean, foreground)** — agar 1-4 dan keyin ham davom etish
   qaror qilinsa.
6. Earnings/Fuel qo'lda-kiritish — Trip Logger bilan bir vaqtda, chunki bir
   xil "kunlik yopish" UX oqimiga tegishli.
7. Traffic/Hot Zone/native-GPS — alohida, keyinroq, byudjet/mobil ilova
   qarori qabul qilingandan keyin qayta baholanadi.

---

## 8. Ochiq savollar (implementatsiyadan oldin hal qilinishi kerak)

- Qaysi LLM/STT/TTS provayder? (xarajat, sifat, PL/UZ/RU til qo'llab-quvvatlashi
  solishtirilishi kerak)
- AI so'rov limiti qanday bo'ladi — bepul/premium foydalanuvchi uchun sonlar?
- Suhbat tarixi qancha vaqt saqlanadi (GDPR — Polsha/EU foydalanuvchilari bor)?
- Trip/Earnings/Fuel ma'lumotlari — bular shaxsiy joylashuv/moliyaviy
  ma'lumot, maxfiylik siyosatiga (`Legal.tsx`) qo'shimcha band kerakmi?
