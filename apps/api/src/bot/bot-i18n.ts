export type BotLocale = 'uz' | 'ru' | 'en';

export function isBotLocale(value: string): value is BotLocale {
  return value === 'uz' || value === 'ru' || value === 'en';
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
};

export const CHOOSE_LANGUAGE_TEXT = "🌐 Tilni tanlang / Выберите язык / Choose language:";

export const LANGUAGE_BUTTONS = [
  [{ text: "🇺🇿 O'zbekcha", callback_data: 'SET_LANG:uz' }],
  [{ text: '🇷🇺 Русский', callback_data: 'SET_LANG:ru' }],
  [{ text: '🇬🇧 English', callback_data: 'SET_LANG:en' }],
];
