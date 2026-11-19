
export type BotLocale = 'uz' | 'ru' | 'en' | 'pl' | 'uk';

export const BOT_LOCALES: BotLocale[] = ['uz', 'ru', 'en', 'pl', 'uk'];

export function isBotLocale(value: string): value is BotLocale {
  return (BOT_LOCALES as string[]).includes(value);
}

interface BotText {
  welcome: string;
  openWebapp: string;
  mainMenuTitle: string;
  menuTheory: string;
  menuPsych: string;
  menuSigns: string;
  menuRoadmap: string;
}

export const BOT_TEXT: Record<BotLocale, BotText> = {
  uz: {
    welcome:
      "Assalomu alaykum! 👋\n\nDriveMaster — Polshada haydovchilik guvohnomasi olish jarayonini (prawo jazdy) sizga oson qiladi: teoriya savollari, yo'l belgilari va psixologik ko'rik haqida ma'lumot — barchasi UZB tilida.\n\nIlovani ochish uchun tugmani bosing 👇",
    openWebapp: "🚀 Ilovani ochish",
    mainMenuTitle: '🏠 Bosh menyu',
    menuTheory: '📘 Teoriya',
    menuPsych: '🧠 Psixologiya',
    menuSigns: "🚦 Yo'l belgilari",
    menuRoadmap: "🗺 Yo'l xaritasi (Roadmap)",
  },
  ru: {
    welcome:
      'Здравствуйте! 👋\n\nDriveMaster упрощает для вас процесс получения водительских прав в Польше (prawo jazdy): вопросы теории, дорожные знаки и информация о психологическом осмотре — всё на русском языке.\n\nНажмите кнопку, чтобы открыть приложение 👇',
    openWebapp: '🚀 Открыть приложение',
    mainMenuTitle: '🏠 Главное меню',
    menuTheory: '📘 Теория',
    menuPsych: '🧠 Психология',
    menuSigns: '🚦 Дорожные знаки',
    menuRoadmap: '🗺 Дорожная карта (Roadmap)',
  },
  en: {
    welcome:
      "Hello! 👋\n\nDriveMaster makes getting a Polish driving licence (prawo jazdy) easy for you: theory questions, road signs, and information about the psychological exam — all in English.\n\nTap the button below to open the app 👇",
    openWebapp: '🚀 Open the app',
    mainMenuTitle: '🏠 Main menu',
    menuTheory: '📘 Theory',
    menuPsych: '🧠 Psychology',
    menuSigns: '🚦 Road signs',
    menuRoadmap: '🗺 Roadmap',
  },
  pl: {
    welcome:
      'Cześć! 👋\n\nDriveMaster ułatwia Ci uzyskanie polskiego prawa jazdy: pytania z teorii, znaki drogowe i informacje o badaniu psychologicznym — wszystko po polsku.\n\nNaciśnij przycisk, aby otworzyć aplikację 👇',
    openWebapp: '🚀 Otwórz aplikację',
    mainMenuTitle: '🏠 Menu główne',
    menuTheory: '📘 Teoria',
    menuPsych: '🧠 Psychologia',
    menuSigns: '🚦 Znaki drogowe',
    menuRoadmap: '🗺 Mapa drogowa (Roadmap)',
  },
  uk: {
    welcome:
      'Вітаємо! 👋\n\nDriveMaster спрощує для вас отримання водійського посвідчення в Польщі (prawo jazdy): запитання з теорії, дорожні знаки та інформація про психологічний огляд — усе українською.\n\nНатисніть кнопку, щоб відкрити застосунок 👇',
    openWebapp: '🚀 Відкрити застосунок',
    mainMenuTitle: '🏠 Головне меню',
    menuTheory: '📘 Теорія',
    menuPsych: '🧠 Психологія',
    menuSigns: '🚦 Дорожні знаки',
    menuRoadmap: '🗺 Дорожня карта (Roadmap)',
  },
};

export const CHOOSE_LANGUAGE_TEXT =
  '🌐 Tilni tanlang / Выберите язык / Choose language / Wybierz język / Оберіть мову:';

export const LANGUAGE_BUTTONS = [
  [{ text: '🇵🇱 Polski', callback_data: 'SET_LANG:pl' }],
  [{ text: '🇬🇧 English', callback_data: 'SET_LANG:en' }],
  [{ text: "🇺🇿 O'zbekcha", callback_data: 'SET_LANG:uz' }],
  [{ text: '🇷🇺 Русский', callback_data: 'SET_LANG:ru' }],
  [{ text: '🇺🇦 Українська', callback_data: 'SET_LANG:uk' }],
];

/** Bot profili (BotFather "Description" / "About") — Telegram har bir til uchun alohida ko'rsatadi. */
const LANGS_LINE = "🇺🇿 O'zbekcha · 🇷🇺 Русский · 🇬🇧 English · 🇵🇱 Polski · 🇺🇦 Українська";

export interface BotProfile {
  description: string;
  shortDescription: string;
}

export const BOT_PROFILE_DEFAULT: BotProfile = {
  description: `DriveMaster — Polish driving licence helper (prawo jazdy): WORD exam questions, 24-point system, road signs, fines and psychotests.\n\n🌐 ${LANGS_LINE}`,
  shortDescription: 'Polish driving licence prep — WORD, road signs, fines. UZ · RU · EN · PL · UK',
};

export const BOT_PROFILE: Record<BotLocale, BotProfile> = {
  uz: {
    description: `DriveMaster — Polsha yo'l harakati qoidalari, WORD imtihon savollari, 24 ball tizimi, chorrahalar, jarimalar va psixotestlar bo'yicha yordamchi.\n\n🌐 5 tilda: ${LANGS_LINE}`,
    shortDescription: "Polsha haydovchilik guvohnomasi: WORD, belgilar, jarimalar — 5 tilda",
  },
  ru: {
    description: `DriveMaster — помощник по польским ПДД, экзаменам WORD, системе 24 пунктов, перекрёсткам, штрафам и психотестам.\n\n🌐 5 языков: ${LANGS_LINE}`,
    shortDescription: 'Польские водительские права: WORD, знаки, штрафы — на 5 языках',
  },
  en: {
    description: `DriveMaster — assistant for Polish traffic rules, WORD exams, the 24-point system, intersections, fines and psychotests.\n\n🌐 5 languages: ${LANGS_LINE}`,
    shortDescription: 'Polish driving licence prep: WORD, road signs, fines — in 5 languages',
  },
  pl: {
    description: `DriveMaster — asystent do polskich przepisów drogowych, egzaminów WORD, systemu 24 punktów, skrzyżowań, mandatów i psychotestów.\n\n🌐 5 języków: ${LANGS_LINE}`,
    shortDescription: 'Prawo jazdy w Polsce: WORD, znaki, mandaty — w 5 językach',
  },
  uk: {
    description: `DriveMaster — помічник з польських ПДР, іспитів WORD, системи 24 балів, перехресть, штрафів і психотестів.\n\n🌐 5 мов: ${LANGS_LINE}`,
    shortDescription: 'Польське водійське посвідчення: WORD, знаки, штрафи — 5 мовами',
  },
};
