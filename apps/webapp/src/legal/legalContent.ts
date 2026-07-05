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
};
