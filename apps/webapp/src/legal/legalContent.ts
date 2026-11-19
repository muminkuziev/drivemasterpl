import type { Locale } from '../i18n/LocaleContext';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

const CONTACT_EMAIL = 'muminkuziev@gmail.com';
const CONTACT_TELEGRAM = '@founder_mk';
const OWNER_NAME = 'Mumin Kuziev';

export const TERMS_CONTENT: Record<Locale, LegalDoc> = {
  uz: {
    title: 'Foydalanish shartlari',
    updated: 'Oxirgi yangilanish: 2026-yil iyul',
    sections: [
      {
        heading: '1. Umumiy qoidalar',
        body: [
          'DriveMaster — Polshada haydovchilik guvohnomasi (prawo jazdy) olish jarayonida yordam beruvchi Telegram bot va veb-ilova ("Xizmat"). Xizmatdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Agar rozilik bildirmasangiz, Xizmatdan foydalanmang.',
        ],
      },
      {
        heading: '2. Xizmat ko\'rsatuvchi',
        body: [
          `Xizmatni jismoniy shaxs sifatida ${OWNER_NAME} taqdim etadi. Aloqa: ${CONTACT_EMAIL} yoki Telegram ${CONTACT_TELEGRAM}. Xizmat hozircha rasmiy tadbirkorlik subyekti (JDG) sifatida ro'yxatdan o'tmagan — bu holat o'zgarishi mumkin, va bu haqda ushbu sahifada xabar beriladi.`,
        ],
      },
      {
        heading: '3. Xizmat tavsifi',
        body: [
          "Xizmat quyidagilarni o'z ichiga oladi: teoriya imtihoni savollari (matn, rasm, video shaklida), yo'l belgilari izohi, psixologik ko'rik uchun mashqlar va WORD markazlari haqida ma'lumot. Xizmat rasmiy davlat organi (WORD, tegishli vazirlik) bilan bog'liq emas va ularning o'rnini bosmaydi.",
        ],
      },
      {
        heading: "4. Kontentdan foydalanish cheklovlari",
        body: [
          "Premium foydalanuvchiga taqdim etiladigan video va rasm materiallarini ekrandan yozib olish, ko'chirib olish, saqlash, boshqa shaxslarga uzatish yoki ommaviy joylashtirish qat'iyan taqiqlanadi.",
          "Har bir premium kontent foydalanuvchi identifikatorini o'z ichiga olgan belgi (watermark) bilan taqdim etiladi. Ushbu qoidani buzgan foydalanuvchining premium huquqi oldindan ogohlantirishsiz bekor qilinishi mumkin, bunday holda to'lov qaytarilmaydi.",
        ],
      },
      {
        heading: '5. Premium obuna va to\'lov',
        body: [
          "Premium huquq hozircha qo'lda tekshiriladigan bank o'tkazmasi (BLIK) orqali taqdim etiladi: foydalanuvchi ko'rsatilgan summani ko'rsatilgan telefon raqamiga o'tkazadi va ilovada telefon raqamini kiritib tasdiqlash so'rovini yuboradi.",
          "Admin to'lovni tekshirgach, premium huquq qo'lda yoqiladi. Tekshirish vaqti kafolatlanmaydi. Xato yoki noto'g'ri yuborilgan to'lovlar bo'yicha qaytarish masalasi individual tartibda, aloqa orqali ko'rib chiqiladi.",
          "Premium huquq bitta qurilmaga bog'lanadi — bu texnik cheklov, cheksiz ulashishning oldini olish uchun qo'llaniladi.",
        ],
      },
      {
        heading: '6. Kontentning aniqligi',
        body: [
          "Teoriya savollari va ularning tarjimalari o'quv-yordamchi maqsadda taqdim etiladi. Xizmat rasmiy imtihonda muvaffaqiyatni kafolatlamaydi. Dolzarb, rasmiy qoidalar uchun har doim rasmiy davlat manbalariga murojaat qiling.",
        ],
      },
      {
        heading: "7. Hisobni cheklash",
        body: [
          "Ushbu shartlarni buzgan foydalanuvchining Xizmatdan foydalanish huquqi (jumladan premium huquqi) oldindan ogohlantirishsiz cheklanishi yoki bekor qilinishi mumkin.",
        ],
      },
      {
        heading: 'Javobgarlikni cheklash',
        body: [
          'Xizmat "qanday bo\'lsa shunday" (as is) taqdim etiladi, hech qanday kafolatsiz. Xizmat ko\'rsatuvchi Xizmatdan foydalanish natijasida yuzaga kelgan bilvosita zararlar uchun javobgar emas.',
        ],
      },
      {
        heading: "9. O'zgartirishlar",
        body: [
          "Ushbu shartlar vaqti-vaqti bilan yangilanishi mumkin. Muhim o'zgarishlar haqida Xizmat ichida xabar beriladi.",
        ],
      },
      {
        heading: '10. Amal qiluvchi qonunchilik',
        body: ['Ushbu shartlar Polsha Respublikasi qonunchiligiga muvofiq tartibga solinadi.'],
      },
      {
        heading: '11. Aloqa',
        body: [`Savollar bo'yicha: ${CONTACT_EMAIL} yoki Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  ru: {
    title: 'Условия использования',
    updated: 'Последнее обновление: июль 2026',
    sections: [
      {
        heading: '1. Общие положения',
        body: [
          'DriveMaster — Telegram-бот и веб-приложение ("Сервис"), помогающие в процессе получения водительских прав в Польше (prawo jazdy). Используя Сервис, вы соглашаетесь с настоящими условиями. Если вы не согласны — не используйте Сервис.',
        ],
      },
      {
        heading: '2. Поставщик услуги',
        body: [
          `Сервис предоставляется физическим лицом — ${OWNER_NAME}. Контакты: ${CONTACT_EMAIL} или Telegram ${CONTACT_TELEGRAM}. На данный момент Сервис не зарегистрирован как официальный субъект предпринимательства (JDG) — это может измениться, о чём будет сообщено на этой странице.`,
        ],
      },
      {
        heading: '3. Описание сервиса',
        body: [
          'Сервис включает: вопросы теоретического экзамена (текст, фото, видео), пояснения к дорожным знакам, упражнения для психологического осмотра и информацию о центрах WORD. Сервис не связан с официальными государственными органами (WORD, соответствующее министерство) и не заменяет их.',
        ],
      },
      {
        heading: '4. Ограничения на использование контента',
        body: [
          'Категорически запрещается записывать с экрана, копировать, сохранять, передавать третьим лицам или публично распространять видео- и фотоматериалы, предоставляемые премиум-пользователю.',
          'Каждый премиум-контент содержит водяной знак с идентификатором пользователя. При нарушении этого правила премиум-доступ пользователя может быть отменён без предварительного предупреждения, оплата в этом случае не возвращается.',
        ],
      },
      {
        heading: '5. Премиум-подписка и оплата',
        body: [
          'Премиум-доступ в настоящее время предоставляется через вручную проверяемый банковский перевод (BLIK): пользователь переводит указанную сумму на указанный номер телефона и отправляет запрос в приложении, указав свой номер телефона.',
          'После проверки оплаты администратором премиум-доступ включается вручную. Время проверки не гарантируется. Вопросы возврата при ошибочных переводах рассматриваются индивидуально, через контакты, указанные ниже.',
          'Премиум-доступ привязывается к одному устройству — это техническое ограничение для предотвращения неограниченного совместного использования.',
        ],
      },
      {
        heading: '6. Точность контента',
        body: [
          'Вопросы теории и их переводы предоставляются в учебно-вспомогательных целях. Сервис не гарантирует успешную сдачу официального экзамена. Для актуальных официальных правил всегда обращайтесь к официальным государственным источникам.',
        ],
      },
      {
        heading: '7. Ограничение доступа',
        body: [
          'Доступ пользователя, нарушившего настоящие условия (включая премиум-доступ), может быть ограничен или отменён без предварительного предупреждения.',
        ],
      },
      {
        heading: 'Ограничение ответственности',
        body: [
          'Сервис предоставляется "как есть" (as is), без каких-либо гарантий. Поставщик услуги не несёт ответственности за любые косвенные убытки, возникшие в результате использования Сервиса.',
        ],
      },
      {
        heading: '9. Изменения',
        body: [
          'Настоящие условия могут периодически обновляться. О существенных изменениях будет сообщено внутри Сервиса.',
        ],
      },
      {
        heading: '10. Применимое право',
        body: ['Настоящие условия регулируются законодательством Республики Польша.'],
      },
      {
        heading: '11. Контакты',
        body: [`По вопросам: ${CONTACT_EMAIL} или Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: '1. General',
        body: [
          'DriveMaster is a Telegram bot and web app ("Service") that helps with the process of obtaining a Polish driving licence (prawo jazdy). By using the Service, you agree to these terms. If you do not agree, please do not use the Service.',
        ],
      },
      {
        heading: '2. Service provider',
        body: [
          `The Service is provided by an individual, ${OWNER_NAME}. Contact: ${CONTACT_EMAIL} or Telegram ${CONTACT_TELEGRAM}. The Service is not currently registered as a formal business entity (JDG) — this may change, and any change will be announced on this page.`,
        ],
      },
      {
        heading: '3. Description of the Service',
        body: [
          'The Service includes: theory exam questions (text, photo, and video), road sign explanations, exercises for the psychological examination, and information about WORD centres. The Service is not affiliated with, and does not replace, any official government body (WORD, the relevant ministry).',
        ],
      },
      {
        heading: '4. Content usage restrictions',
        body: [
          'Screen recording, copying, saving, forwarding to third parties, or publicly redistributing the video and photo material provided to premium users is strictly prohibited.',
          "Each piece of premium content is delivered with a watermark containing the user's identifier. Violating this rule may result in the user's premium access being revoked without prior warning, with no refund of any payment made.",
        ],
      },
      {
        heading: '5. Premium subscription and payment',
        body: [
          'Premium access is currently granted through a manually verified bank transfer (BLIK): the user transfers the stated amount to the stated phone number and submits a confirmation request in the app with their phone number.',
          'Once the admin verifies the payment, premium access is activated manually. Review time is not guaranteed. Refunds for mistaken or incorrect payments are reviewed on a case-by-case basis via the contact details below.',
          'Premium access is bound to a single device — a technical limitation intended to prevent unlimited sharing.',
        ],
      },
      {
        heading: '6. Content accuracy',
        body: [
          'Theory questions and their translations are provided for study-support purposes. The Service does not guarantee success in the official exam. Always consult official government sources for current, authoritative regulations.',
        ],
      },
      {
        heading: '7. Account restriction',
        body: [
          "A user who violates these terms may have their access to the Service (including premium access) restricted or revoked without prior warning.",
        ],
      },
      {
        heading: 'Limitation of liability',
        body: [
          'The Service is provided "as is", without warranties of any kind. The service provider is not liable for any indirect damages arising from use of the Service.',
        ],
      },
      {
        heading: '9. Changes',
        body: [
          'These terms may be updated from time to time. Material changes will be announced within the Service.',
        ],
      },
      {
        heading: '10. Governing law',
        body: ['These terms are governed by the laws of the Republic of Poland.'],
      },
      {
        heading: '11. Contact',
        body: [`Questions: ${CONTACT_EMAIL} or Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  pl: {
    title: 'Regulamin',
    updated: 'Ostatnia aktualizacja: lipiec 2026',
    sections: [
      {
        heading: '1. Postanowienia ogólne',
        body: [
          'DriveMaster to bot w Telegramie i aplikacja internetowa („Usługa”), które pomagają w procesie uzyskania polskiego prawa jazdy. Korzystając z Usługi, akceptujesz niniejszy regulamin. Jeśli się z nim nie zgadzasz, nie korzystaj z Usługi.',
        ],
      },
      {
        heading: '2. Usługodawca',
        body: [
          `Usługę świadczy osoba fizyczna, ${OWNER_NAME}. Kontakt: ${CONTACT_EMAIL} lub Telegram ${CONTACT_TELEGRAM}. Usługa nie jest obecnie zarejestrowana jako działalność gospodarcza (JDG) — może się to zmienić, a każda zmiana zostanie ogłoszona na tej stronie.`,
        ],
      },
      {
        heading: '3. Opis Usługi',
        body: [
          'Usługa obejmuje: pytania egzaminacyjne z teorii (tekstowe, ze zdjęciami i wideo), objaśnienia znaków drogowych, ćwiczenia do badania psychologicznego oraz informacje o ośrodkach WORD. Usługa nie jest powiązana z żadnym organem państwowym (WORD, właściwe ministerstwo) i go nie zastępuje.',
        ],
      },
      {
        heading: '4. Ograniczenia dotyczące korzystania z treści',
        body: [
          'Nagrywanie ekranu, kopiowanie, zapisywanie, przekazywanie osobom trzecim ani publiczne rozpowszechnianie materiałów wideo i zdjęć udostępnianych użytkownikom Premium jest surowo zabronione.',
          'Każda treść Premium jest dostarczana ze znakiem wodnym zawierającym identyfikator użytkownika. Naruszenie tej zasady może skutkować odebraniem dostępu Premium bez wcześniejszego ostrzeżenia i bez zwrotu dokonanej płatności.',
        ],
      },
      {
        heading: '5. Subskrypcja Premium i płatność',
        body: [
          'Dostęp Premium jest obecnie przyznawany po ręcznie weryfikowanym przelewie (BLIK): użytkownik przesyła wskazaną kwotę na wskazany numer telefonu i składa w aplikacji wniosek o potwierdzenie, podając swój numer telefonu.',
          'Po zweryfikowaniu płatności przez administratora dostęp Premium jest aktywowany ręcznie. Czas sprawdzenia nie jest gwarantowany. Zwroty za omyłkowe lub błędne płatności są rozpatrywane indywidualnie za pośrednictwem danych kontaktowych poniżej.',
          'Dostęp Premium jest przypisany do jednego urządzenia — to ograniczenie techniczne mające zapobiegać nieograniczonemu udostępnianiu.',
        ],
      },
      {
        heading: '6. Rzetelność treści',
        body: [
          'Pytania teoretyczne i ich tłumaczenia służą wsparciu nauki. Usługa nie gwarantuje zdania oficjalnego egzaminu. Aktualne i wiążące przepisy zawsze sprawdzaj w oficjalnych źródłach państwowych.',
        ],
      },
      {
        heading: '7. Ograniczenie konta',
        body: [
          'Użytkownik, który narusza niniejszy regulamin, może zostać pozbawiony dostępu do Usługi (w tym dostępu Premium) lub może on zostać ograniczony bez wcześniejszego ostrzeżenia.',
        ],
      },
      {
        heading: '8. Ograniczenie odpowiedzialności',
        body: [
          'Usługa jest świadczona „w stanie, w jakim jest”, bez jakichkolwiek gwarancji. Usługodawca nie ponosi odpowiedzialności za szkody pośrednie wynikające z korzystania z Usługi.',
        ],
      },
      {
        heading: '9. Zmiany',
        body: [
          'Niniejszy regulamin może być co pewien czas aktualizowany. O istotnych zmianach poinformujemy w ramach Usługi.',
        ],
      },
      {
        heading: '10. Prawo właściwe',
        body: ['Niniejszy regulamin podlega prawu Rzeczypospolitej Polskiej.'],
      },
      {
        heading: '11. Kontakt',
        body: [`Pytania: ${CONTACT_EMAIL} lub Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  uk: {
    title: 'Умови користування',
    updated: 'Останнє оновлення: липень 2026',
    sections: [
      {
        heading: '1. Загальні положення',
        body: [
          'DriveMaster — це бот у Telegram і вебзастосунок («Сервіс»), що допомагає в процесі отримання польського водійського посвідчення (prawo jazdy). Користуючись Сервісом, ви погоджуєтеся з цими умовами. Якщо ви не згодні, не користуйтеся Сервісом.',
        ],
      },
      {
        heading: '2. Надавач Сервісу',
        body: [
          `Сервіс надає фізична особа, ${OWNER_NAME}. Контакти: ${CONTACT_EMAIL} або Telegram ${CONTACT_TELEGRAM}. Наразі Сервіс не зареєстровано як суб'єкт господарювання (JDG) — це може змінитися, і про будь-які зміни буде повідомлено на цій сторінці.`,
        ],
      },
      {
        heading: '3. Опис Сервісу',
        body: [
          'Сервіс містить: запитання теоретичного іспиту (текстові, з фото та відео), пояснення дорожніх знаків, вправи до психологічного огляду та інформацію про центри WORD. Сервіс не пов\'язаний з жодним державним органом (WORD, відповідне міністерство) і не замінює його.',
        ],
      },
      {
        heading: '4. Обмеження щодо використання контенту',
        body: [
          'Запис екрана, копіювання, збереження, передавання третім особам або публічне поширення відео- та фотоматеріалів, наданих користувачам Premium, суворо заборонені.',
          'Кожен елемент преміум-контенту постачається з водяним знаком, що містить ідентифікатор користувача. Порушення цього правила може призвести до скасування преміум-доступу без попередження та без повернення сплачених коштів.',
        ],
      },
      {
        heading: '5. Підписка Premium і оплата',
        body: [
          'Преміум-доступ наразі надається після переказу (BLIK), що перевіряється вручну: користувач переказує вказану суму на вказаний номер телефону та подає в застосунку запит на підтвердження, вказавши свій номер телефону.',
          'Після перевірки платежу адміністратором преміум-доступ активується вручну. Час перевірки не гарантується. Повернення коштів за помилкові або неправильні платежі розглядається індивідуально за наведеними нижче контактами.',
          'Преміум-доступ прив\'язаний до одного пристрою — це технічне обмеження, покликане запобігти необмеженому поширенню.',
        ],
      },
      {
        heading: '6. Достовірність контенту',
        body: [
          'Теоретичні запитання та їхні переклади надаються для допомоги в навчанні. Сервіс не гарантує успішного складання офіційного іспиту. Актуальні та остаточні правила завжди перевіряйте в офіційних державних джерелах.',
        ],
      },
      {
        heading: '7. Обмеження облікового запису',
        body: [
          'Користувач, який порушує ці умови, може бути позбавлений доступу до Сервісу (зокрема преміум-доступу) або обмежений у ньому без попередження.',
        ],
      },
      {
        heading: '8. Обмеження відповідальності',
        body: [
          'Сервіс надається «як є», без жодних гарантій. Надавач Сервісу не несе відповідальності за будь-яку непряму шкоду, що виникла внаслідок користування Сервісом.',
        ],
      },
      {
        heading: '9. Зміни',
        body: [
          'Ці умови можуть час від часу оновлюватися. Про суттєві зміни буде повідомлено в Сервісі.',
        ],
      },
      {
        heading: '10. Застосовне право',
        body: ['Ці умови регулюються законодавством Республіки Польща.'],
      },
      {
        heading: '11. Контакти',
        body: [`Питання: ${CONTACT_EMAIL} або Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
};

export const PRIVACY_CONTENT: Record<Locale, LegalDoc> = {
  uz: {
    title: 'Maxfiylik siyosati',
    updated: 'Oxirgi yangilanish: 2026-yil iyul',
    sections: [
      {
        heading: "1. Ma'lumot nazoratchisi",
        body: [
          `Ushbu Xizmat doirasida shaxsiy ma'lumotlaringizni qayta ishlovchi shaxs — ${OWNER_NAME}. Aloqa: ${CONTACT_EMAIL} yoki Telegram ${CONTACT_TELEGRAM}.`,
        ],
      },
      {
        heading: "2. Qanday ma'lumotlar yig'iladi",
        body: [
          "— Telegram ID, ism va username (bot orqali avtomatik olinadi)",
          "— Til tanlovi",
          "— Qurilma identifikatori (localStorage'da saqlanadi, premium kontentni bitta qurilmaga bog'lash uchun)",
          "— Telefon raqami (faqat premium so'rovi yuborilganda, to'lovni tasdiqlash uchun)",
          "— Teoriya va psixologik testlar natijalari, statistika",
        ],
      },
      {
        heading: "3. Ma'lumotlar nima uchun ishlatiladi",
        body: [
          "— Xizmatni ko'rsatish va shaxsiylashtirish (til, progress)",
          "— Premium huquqni tasdiqlash va boshqarish",
          "— Kontentni ruxsatsiz tarqatishning oldini olish (qurilma bog'lash, watermark)",
          "— Xizmatni yaxshilash (umumiy statistika)",
        ],
      },
      {
        heading: "4. Ma'lumotlarni kim bilan bo'lishamiz",
        body: [
          "Ma'lumotlaringiz uchinchi tomonlarga sotilmaydi va reklama maqsadida berilmaydi. Ma'lumotlar Telegram platformasi (xabar almashish uchun) va ma'lumotlar bazasi provayderi orqali qayta ishlanadi.",
        ],
      },
      {
        heading: '5. Saqlash muddati',
        body: [
          "Ma'lumotlar hisobingiz mavjud bo'lgan davrda saqlanadi. O'chirishni so'rasangiz, ma'lumotlaringiz o'chiriladi (qonuniy talab qilingan hollar bundan mustasno).",
        ],
      },
      {
        heading: '6. Sizning huquqlaringiz',
        body: [
          "GDPR (EU 2016/679) asosida sizda quyidagi huquqlar bor: ma'lumotlaringizni ko'rish, tuzatish, o'chirishni so'rash va qayta ishlashga qarshi chiqish. So'rov uchun quyidagi aloqa orqali murojaat qiling.",
        ],
      },
      {
        heading: '7. Cookie va localStorage',
        body: [
          "Ilova brauzeringizning localStorage'ida til tanlovi va qurilma identifikatorini saqlaydi — bular kuzatuv yoki reklama maqsadida emas, faqat Xizmat funksiyasi uchun ishlatiladi.",
        ],
      },
      {
        heading: '8. Bolalar maxfiyligi',
        body: ["Xizmat 13 yoshdan kichik bolalar uchun mo'ljallanmagan."],
      },
      {
        heading: "9. Siyosatga o'zgartirish",
        body: [
          "Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin, muhim o'zgarishlar haqida Xizmat ichida xabar beriladi.",
        ],
      },
      {
        heading: '10. Aloqa',
        body: [`Savollar bo'yicha: ${CONTACT_EMAIL} yoki Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: июль 2026',
    sections: [
      {
        heading: '1. Контролёр данных',
        body: [
          `Лицом, обрабатывающим ваши персональные данные в рамках Сервиса, является ${OWNER_NAME}. Контакты: ${CONTACT_EMAIL} или Telegram ${CONTACT_TELEGRAM}.`,
        ],
      },
      {
        heading: '2. Какие данные собираются',
        body: [
          '— Telegram ID, имя и username (автоматически через бота)',
          '— Выбор языка',
          '— Идентификатор устройства (хранится в localStorage, для привязки премиум-контента к одному устройству)',
          '— Номер телефона (только при запросе премиум-доступа, для подтверждения оплаты)',
          '— Результаты и статистика по тестам теории и психологическим тестам',
        ],
      },
      {
        heading: '3. Для чего используются данные',
        body: [
          '— Предоставление и персонализация Сервиса (язык, прогресс)',
          '— Подтверждение и управление премиум-доступом',
          '— Предотвращение несанкционированного распространения контента (привязка устройства, водяной знак)',
          '— Улучшение Сервиса (общая статистика)',
        ],
      },
      {
        heading: '4. С кем мы делимся данными',
        body: [
          'Ваши данные не продаются третьим лицам и не передаются в рекламных целях. Данные обрабатываются через платформу Telegram (для обмена сообщениями) и провайдера базы данных.',
        ],
      },
      {
        heading: '5. Срок хранения',
        body: [
          'Данные хранятся, пока существует ваш аккаунт. При запросе на удаление ваши данные будут удалены (за исключением случаев, требуемых законом).',
        ],
      },
      {
        heading: '6. Ваши права',
        body: [
          'На основании GDPR (EU 2016/679) у вас есть право на доступ к своим данным, их исправление, удаление и возражение против обработки. Для запроса используйте контакты ниже.',
        ],
      },
      {
        heading: '7. Cookie и localStorage',
        body: [
          'Приложение хранит выбор языка и идентификатор устройства в localStorage вашего браузера — это используется исключительно для функциональности Сервиса, а не для слежения или рекламы.',
        ],
      },
      {
        heading: '8. Конфиденциальность детей',
        body: ['Сервис не предназначен для детей младше 13 лет.'],
      },
      {
        heading: '9. Изменения политики',
        body: [
          'Настоящая политика может периодически обновляться, о существенных изменениях будет сообщено внутри Сервиса.',
        ],
      },
      {
        heading: '10. Контакты',
        body: [`По вопросам: ${CONTACT_EMAIL} или Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: '1. Data controller',
        body: [
          `The person processing your personal data within this Service is ${OWNER_NAME}. Contact: ${CONTACT_EMAIL} or Telegram ${CONTACT_TELEGRAM}.`,
        ],
      },
      {
        heading: '2. What data is collected',
        body: [
          '— Telegram ID, first name, and username (collected automatically via the bot)',
          '— Language preference',
          '— Device identifier (stored in localStorage, used to bind premium content to a single device)',
          '— Phone number (only when a premium request is submitted, to confirm payment)',
          '— Theory and psychological test results and statistics',
        ],
      },
      {
        heading: '3. Why the data is used',
        body: [
          '— To provide and personalise the Service (language, progress)',
          '— To confirm and manage premium access',
          '— To prevent unauthorised redistribution of content (device binding, watermark)',
          '— To improve the Service (aggregate statistics)',
        ],
      },
      {
        heading: '4. Who we share data with',
        body: [
          'Your data is not sold to third parties and is not shared for advertising purposes. Data is processed via the Telegram platform (for messaging) and our database provider.',
        ],
      },
      {
        heading: '5. Retention period',
        body: [
          'Data is retained for as long as your account exists. If you request deletion, your data will be deleted (except where retention is legally required).',
        ],
      },
      {
        heading: '6. Your rights',
        body: [
          'Under the GDPR (EU 2016/679) you have the right to access, correct, and request deletion of your data, and to object to its processing. Use the contact details below to make a request.',
        ],
      },
      {
        heading: '7. Cookies and localStorage',
        body: [
          "The app stores your language preference and device identifier in your browser's localStorage — these are used solely for the Service's functionality, not for tracking or advertising.",
        ],
      },
      {
        heading: "8. Children's privacy",
        body: ['The Service is not intended for children under the age of 13.'],
      },
      {
        heading: '9. Changes to this policy',
        body: [
          'This policy may be updated from time to time. Material changes will be announced within the Service.',
        ],
      },
      {
        heading: '10. Contact',
        body: [`Questions: ${CONTACT_EMAIL} or Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  pl: {
    title: 'Polityka prywatności',
    updated: 'Ostatnia aktualizacja: lipiec 2026',
    sections: [
      {
        heading: '1. Administrator danych',
        body: [
          `Osobą przetwarzającą Twoje dane osobowe w ramach tej Usługi jest ${OWNER_NAME}. Kontakt: ${CONTACT_EMAIL} lub Telegram ${CONTACT_TELEGRAM}.`,
        ],
      },
      {
        heading: '2. Jakie dane są zbierane',
        body: [
          '— Identyfikator Telegram, imię i nazwa użytkownika (zbierane automatycznie przez bota)',
          '— Preferowany język',
          '— Identyfikator urządzenia (przechowywany w localStorage, służy do powiązania treści Premium z jednym urządzeniem)',
          '— Numer telefonu (tylko przy składaniu wniosku o Premium, w celu potwierdzenia płatności)',
          '— Wyniki i statystyki testów teoretycznych i psychologicznych',
        ],
      },
      {
        heading: '3. W jakim celu dane są wykorzystywane',
        body: [
          '— Aby świadczyć i personalizować Usługę (język, postępy)',
          '— Aby potwierdzać i zarządzać dostępem Premium',
          '— Aby zapobiegać nieuprawnionemu rozpowszechnianiu treści (powiązanie z urządzeniem, znak wodny)',
          '— Aby ulepszać Usługę (statystyki zbiorcze)',
        ],
      },
      {
        heading: '4. Komu udostępniamy dane',
        body: [
          'Twoje dane nie są sprzedawane osobom trzecim ani udostępniane w celach reklamowych. Dane są przetwarzane za pośrednictwem platformy Telegram (do komunikacji) oraz dostawcy naszej bazy danych.',
        ],
      },
      {
        heading: '5. Okres przechowywania',
        body: [
          'Dane są przechowywane tak długo, jak istnieje Twoje konto. Jeśli poprosisz o usunięcie, Twoje dane zostaną usunięte (z wyjątkiem sytuacji, gdy przepisy prawa wymagają ich zachowania).',
        ],
      },
      {
        heading: '6. Twoje prawa',
        body: [
          'Na podstawie RODO (UE 2016/679) masz prawo dostępu do swoich danych, ich sprostowania i żądania usunięcia oraz prawo sprzeciwu wobec ich przetwarzania. Aby złożyć wniosek, skorzystaj z danych kontaktowych poniżej.',
        ],
      },
      {
        heading: '7. Pliki cookie i localStorage',
        body: [
          'Aplikacja zapisuje w localStorage przeglądarki Twój preferowany język i identyfikator urządzenia — służą one wyłącznie do działania Usługi, a nie do śledzenia ani reklam.',
        ],
      },
      {
        heading: '8. Prywatność dzieci',
        body: ['Usługa nie jest przeznaczona dla dzieci poniżej 13. roku życia.'],
      },
      {
        heading: '9. Zmiany w polityce',
        body: [
          'Niniejsza polityka może być co pewien czas aktualizowana. O istotnych zmianach poinformujemy w ramach Usługi.',
        ],
      },
      {
        heading: '10. Kontakt',
        body: [`Pytania: ${CONTACT_EMAIL} lub Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
  uk: {
    title: 'Політика конфіденційності',
    updated: 'Останнє оновлення: липень 2026',
    sections: [
      {
        heading: '1. Контролер даних',
        body: [
          `Особа, яка обробляє ваші персональні дані в межах цього Сервісу, — ${OWNER_NAME}. Контакти: ${CONTACT_EMAIL} або Telegram ${CONTACT_TELEGRAM}.`,
        ],
      },
      {
        heading: '2. Які дані збираються',
        body: [
          '— Telegram ID, ім\'я та нікнейм (збираються автоматично через бота)',
          '— Обрана мова',
          '— Ідентифікатор пристрою (зберігається в localStorage, використовується для прив\'язки преміум-контенту до одного пристрою)',
          '— Номер телефону (лише під час подання запиту на Premium, для підтвердження платежу)',
          '— Результати та статистика теоретичних і психологічних тестів',
        ],
      },
      {
        heading: '3. Для чого використовуються дані',
        body: [
          '— Щоб надавати та персоналізувати Сервіс (мова, прогрес)',
          '— Щоб підтверджувати й керувати преміум-доступом',
          '— Щоб запобігати несанкціонованому поширенню контенту (прив\'язка до пристрою, водяний знак)',
          '— Щоб покращувати Сервіс (зведена статистика)',
        ],
      },
      {
        heading: '4. З ким ми ділимося даними',
        body: [
          'Ваші дані не продаються третім особам і не передаються для рекламних цілей. Дані обробляються через платформу Telegram (для обміну повідомленнями) та постачальника нашої бази даних.',
        ],
      },
      {
        heading: '5. Строк зберігання',
        body: [
          'Дані зберігаються, доки існує ваш обліковий запис. Якщо ви попросите видалити їх, ваші дані буде видалено (крім випадків, коли їх зберігання вимагає закон).',
        ],
      },
      {
        heading: '6. Ваші права',
        body: [
          'Відповідно до GDPR (ЄС 2016/679) ви маєте право на доступ до своїх даних, їх виправлення, вимагати їх видалення та заперечувати проти їх обробки. Для подання запиту скористайтеся контактами нижче.',
        ],
      },
      {
        heading: '7. Cookie та localStorage',
        body: [
          'Застосунок зберігає вашу обрану мову та ідентифікатор пристрою в localStorage браузера — вони використовуються виключно для роботи Сервісу, а не для відстеження чи реклами.',
        ],
      },
      {
        heading: '8. Конфіденційність дітей',
        body: ['Сервіс не призначений для дітей віком до 13 років.'],
      },
      {
        heading: '9. Зміни в політиці',
        body: [
          'Ця політика може час від часу оновлюватися. Про суттєві зміни буде повідомлено в Сервісі.',
        ],
      },
      {
        heading: '10. Контакти',
        body: [`Питання: ${CONTACT_EMAIL} або Telegram ${CONTACT_TELEGRAM}.`],
      },
    ],
  },
};
