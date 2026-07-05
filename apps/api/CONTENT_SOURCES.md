# Kontent manbalari

## Teoriya savollari (TheoryQuestion)

- **Manba:** Polsha Infratuzilma vazirligi (Ministerstwo Infrastruktury), rasmiy
  ochiq nashr — https://www.gov.pl/web/infrastruktura/prawo-jazdy
- **Fayl:** `katalog_dla_kandydatów_na_kierowców_052026.xlsx` (3533 ta rasmiy
  savol, kategoriyalar bo'yicha, PL/EN/DE/UA tarjimalari bilan)
- **Holat:** davlat tomonidan nomzodlar uchun ochiq e'lon qilingan — tijorat
  cheklovi yo'q, imtihonga tayyorgarlik uchun mo'ljallangan.
- **Olingan sana:** 2026-07-04
- **Pilot import:** `prisma/pilot-theory-questions.json` — B toifasi uchun
  100 ta rasmni/videoni talab qilmaydigan savol, PL matnidan UZB tiliga
  tarjima qilingan (EN rasmiy tarjimasi tekshirish uchun ishlatilgan).
  10 tasi bepul namuna (`isPremium: false`), qolgani premium.

## Yo'l belgilari (RoadSign)

- **Manba:** Wikimedia Commons, "Diagrams of road signs of Poland" toifa
  daraxti — https://commons.wikimedia.org/wiki/Category:Diagrams_of_road_signs_of_Poland
  Rasmlar Polsha qonunchiligida (Infratuzilma va IViS vazirlari qarori, yo'l
  belgilari va signallari haqida) belgilangan rasmiy davlat ramzlari bo'lgani
  uchun mualliflik huquqisiz (`PD Polish Symbol`, `Public domain`) deb
  litsenziyalangan — bu Wikimedia fayl sahifalaridagi `extmetadata.License`
  maydonida tasdiqlangan.
- **Format:** har bir belgi uchun "PL road sign X-N.svg" nomli vektor fayl;
  Wikimedia API orqali (`imageinfo?iiurlwidth=500`) serverda render qilingan
  PNG thumbnail yuklab olinadi — lokal SVG konvertatsiya kerak emas.
- **Holat (2026-07-04):** A (ogohlantiruvchi, 42), B (ta'qiqlovchi, 55),
  C (buyruq beruvchi, 22), D (axborot, 76), S (svetofor turlari, 7),
  P (yo'l chiziqlari, 30), harakatni boshqaruvchi shaxs (4, matnli — rasmiy
  diagramma topilmadi), panel indikatorlari (14, ISO-standart, PD-self) —
  jami 250 ta belgi import qilingan. E (yo'nalish/shahar) va G/T (qo'shimcha
  taxtachalar) toifalari hali qo'shilmagan — ko'p sonli variant/2026-yil
  qonun o'zgarishlari borligi sabab alohida ehtiyot bilan qilinishi kerak.
- **Skriptlar:** `scripts/fetch-sign-category.js` (Commons toifa ro'yxati),
  `scripts/build-road-signs.js <categoryKey> <dataFile>` (yuklab olish +
  import JSON tayyorlash), `scripts/signs-data/*.json` (kod+PL/UZ nom
  ma'lumotlari).

## Kodeks drogowy / Prawo o ruchu drogowym (Polsha yo'l harakati qonuni)

- **Manba:** isap.sejm.gov.pl — Polsha hukumatining rasmiy qonunlar bazasi
  (Internetowy System Aktów Prawnych). Asosiy birlashtirilgan matn
  2024-06-21 dan (WDU20240001251), 2026-yil yanvarigacha bo'lgan barcha
  o'zgartirishlar bilan (WDU20260000180 va boshqalar) — 2026 yilgi holatga
  mos, faol yangilanadigan rasmiy manba.
- **Qaror (2026-07-04, foydalanuvchi tasdiqlagan):** to'liq qonun matnini
  botga alohida bo'lim sifatida kiritish shart emas — WORD imtihoniga
  kiradigan qismlar (Znaki drogowe, Sygnały i polecenia, Pierwszeństwo,
  Ruch pojazdów, Manewry, Wyprzedzanie, Pierwsza pomoc) allaqachon 250 ta
  yo'l belgisi va 2105 ta teoriya savoli orqali amaliy shaklda qoplangan.
  Huquqiy jarayonlar, jarimalar va transport korxonalariga oid bo'limlar
  WORD imtihoniga kirmaydi — ular ham kerak emas.
- **Foydalanish:** kelajakda yangi savol/belgi tarjimalarini tekshirish
  yoki mavjud kontentdagi nomuvofiqlikni aniqlash kerak bo'lganda ushbu
  rasmiy manbaga murojaat qilinadi.

## Psixologik test bo'limi

Hali qo'shilmagan. Aniqlanishicha, real psixologik ko'rik asosan **apparat
orqali o'tkaziladigan psixomotor test** (masalan, Test Piórkowskiego —
qo'l-ko'z koordinatsiyasini o'lchaydigan asbob), matnli savol-javob shaklida
emas. Shuning uchun proprietary test provayderlari (Psychotesty.pl, PsychoLab
va h.k.) kontentini nusxalash o'rniga, jarayonni tushuntiruvchi original
tayyorgarlik matni tayyorlanishi kerak.
