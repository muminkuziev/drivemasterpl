import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Action, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TheoryService, TheoryLessonType } from '../content/theory.service';
import { THEORY_MEDIA_DIR } from '../content/theory-media-dir.util';
import { RoadSignService } from '../content/road-sign.service';
import { ROAD_SIGN_MEDIA_DIR } from '../content/road-sign-media-dir.util';
import {
  ROAD_SIGN_CATEGORIES,
  RoadSignCategoryKey,
} from '../content/road-sign-categories';
import { UsersService } from '../users/users.service';
import { isAdmin } from './is-admin.util';
import { BOT_TEXT, BotLocale, CHOOSE_LANGUAGE_TEXT, LANGUAGE_BUTTONS, isBotLocale } from './bot-i18n';

type QuestionWithOptions = NonNullable<
  Awaited<ReturnType<TheoryService['getRandomQuestionByType']>>
>;

const LESSON_TYPE_LABELS: Record<TheoryLessonType, string> = {
  text: '📝 Matnli darslik',
  photo: '🖼 Rasmli darslik',
  video: '🎥 Video darslik',
};

function buildMainMenu(isAdmin: boolean, webAppUrl: string | undefined, locale: BotLocale) {
  const t = BOT_TEXT[locale];
  const inline_keyboard: (
    | { text: string; callback_data: string }
    | { text: string; web_app: { url: string } }
  )[][] = [];
  if (webAppUrl) {
    const sep = webAppUrl.includes('?') ? '&' : '?';
    inline_keyboard.push([
      { text: t.openWebapp, web_app: { url: `${webAppUrl}${sep}lang=${locale}` } },
    ]);
  }
  inline_keyboard.push(
    [{ text: t.menuTheory, callback_data: 'THEORY_MENU' }],
    [{ text: t.menuPsych, callback_data: 'PSYCH_MENU' }],
    [{ text: t.menuSigns, callback_data: 'SIGNS_MENU' }],
    [{ text: t.menuRoadmap, callback_data: 'ROADMAP' }],
  );
  if (isAdmin) {
    inline_keyboard.push([{ text: '🛠 Admin panel', callback_data: 'ADMIN_MENU' }]);
  }
  return { reply_markup: { inline_keyboard } };
}

const BACK_TO_MAIN_BUTTON = { text: '⬅️ Bosh menyu', callback_data: 'MAIN_MENU' };

const ROADMAP_TEXT = `🗺 *DriveMaster — to'liq yo'l xaritasi*

1️⃣ Psixologik ko'rik — ⚠️ B toifa uchun odatda SHART EMAS (pastga qarang)
2️⃣ Teoriya kursi
3️⃣ Teoriya imtihoni
4️⃣ Praktika kursi
5️⃣ Praktika imtihoni
6️⃣ Qaysi shaharda oson
7️⃣ Qaysi psixolog markaz yaxshi
8️⃣ Qaysi instruktordan ehtiyot bo'lish kerak`;

const PSYCH_INFO_TEXT = `🧠 *Psixologik ko'rik (badanie psychologiczne) haqida*

⚠️ *Muhim:* oddiy *B toifa* (yengil avtomobil) guvohnomasi olayotgan aksariyat odamlar uchun bu ko'rik *shart emas*.

*Kimlarga majburiy:*
• Professional haydovchilar — C, D toifa (yuk mashinasi, avtobus)
• Taksi va yo'lovchi tashuvchi haydovchilar
• Favqulodda xizmat transporti haydovchilari (tez yordam, politsiya, o't o'chirish)
• Guvohnomasi alkogol/narkotik sababli bekor qilingan va uni qaytarib olmoqchi bo'lganlar
• Tibbiy sabab bilan maxsus yo'naltirilganlar

Agar shu toifalarga kirmasangiz — bu bosqichni butunlay o'tkazib yuborishingiz mumkin.

*Agar sizga kerak bo'lsa, ko'rik shunday o'tadi:*

1️⃣ *Suhbat (wywiad)* — psixolog bilan salomatlik holati, turmush tarzi va haydovchilik tajribangiz haqida suhbat.

2️⃣ *Yozma testlar* — shaxsiyat xususiyatlari, diqqatni jamlash darajasi va vaqt bosimi ostida ishlash qobiliyatini tekshiruvchi savollar.

3️⃣ *Apparat testlari* — reaksiya tezligi, refleks va ko'z-qo'l koordinatsiyasini o'lchaydigan maxsus qurilmalar orqali test (masalan, Piorkowski testi).

4️⃣ *Xulosa* — psixologik xulosa (orzeczenie) beriladi: "haydashga yaroqli" yoki qo'shimcha tekshiruv talab etiladi.

*Davomiyligi:* odatda 45 daqiqadan 1,5 soatgacha (band bo'lmaslik uchun ~2 soat vaqt ajratish tavsiya etiladi).

*Narxi:* 2026-yil holatiga ko'ra maksimal 150 zlotigacha.

*Amal qilish muddati:* professional haydovchilar uchun odatda 5 yil (60 yoshdan keyin — 30 oy).`;

@Update()
export class BotUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly theoryService: TheoryService,
    private readonly roadSignService: RoadSignService,
  ) {}

  private profileFromCtx(ctx: Context) {
    return { username: ctx.from?.username, firstName: ctx.from?.first_name };
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const telegramId = String(ctx.from?.id);
    const user = await this.usersService.findOrCreateByTelegramId(telegramId, this.profileFromCtx(ctx));

    if (user.languageCode && isBotLocale(user.languageCode)) {
      await this.sendWelcome(ctx, user.languageCode);
      return;
    }
    await ctx.reply(CHOOSE_LANGUAGE_TEXT, {
      reply_markup: { inline_keyboard: LANGUAGE_BUTTONS },
    });
  }

  @Action(/^SET_LANG:(uz|ru|en)$/)
  async onSetLanguage(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    await ctx.answerCbQuery().catch(() => {});
    const locale = ctx.match[1] as BotLocale;
    const telegramId = String(ctx.from!.id);
    const user = await this.usersService.findOrCreateByTelegramId(telegramId, this.profileFromCtx(ctx));
    await this.usersService.setLanguage(user.id, locale);
    await this.sendWelcome(ctx, locale);
  }

  private async sendWelcome(ctx: Context, locale: BotLocale) {
    await ctx.reply(
      BOT_TEXT[locale].welcome,
      buildMainMenu(isAdmin(ctx, this.config), this.config.get<string>('WEBAPP_URL'), locale),
    );
  }

  @Action('MAIN_MENU')
  async onMainMenu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery().catch(() => {});
    const telegramId = String(ctx.from!.id);
    const user = await this.usersService.findOrCreateByTelegramId(telegramId, this.profileFromCtx(ctx));
    const locale: BotLocale = user.languageCode && isBotLocale(user.languageCode) ? user.languageCode : 'uz';
    await ctx.reply(
      BOT_TEXT[locale].mainMenuTitle,
      buildMainMenu(isAdmin(ctx, this.config), this.config.get<string>('WEBAPP_URL'), locale),
    );
  }

  @Action('ROADMAP')
  async onRoadmap(@Ctx() ctx: Context) {
    await ctx.answerCbQuery().catch(() => {});
    await ctx.reply(ROADMAP_TEXT, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[BACK_TO_MAIN_BUTTON]] },
    });
  }

  @Action('PSYCH_MENU')
  async onPsychMenu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery().catch(() => {});
    await ctx.reply(PSYCH_INFO_TEXT, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[BACK_TO_MAIN_BUTTON]],
      },
    });
  }

  // ---------- Teoriya ----------

  @Action('THEORY_MENU')
  async onTheoryMenu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery().catch(() => {});
    await ctx.reply('📘 Teoriya — darslik turini tanlang:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: LESSON_TYPE_LABELS.text, callback_data: 'THEORY_TYPE:text' }],
          [{ text: LESSON_TYPE_LABELS.photo, callback_data: 'THEORY_TYPE:photo' }],
          [{ text: LESSON_TYPE_LABELS.video, callback_data: 'THEORY_TYPE:video' }],
          [BACK_TO_MAIN_BUTTON],
        ],
      },
    });
  }

  @Action(/^THEORY_TYPE:(text|photo|video)$/)
  async onTheoryType(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    await ctx.answerCbQuery().catch(() => {});
    const type = ctx.match[1] as TheoryLessonType;
    const user = await this.usersService.findOrCreateByTelegramId(String(ctx.from!.id));
    const question = await this.theoryService.getRandomQuestionByType(type, undefined, user.isPremium);
    if (!question) {
      await ctx.reply(`${LESSON_TYPE_LABELS[type]} bo'yicha savollar hozircha yo'q.`);
      return;
    }
    await this.sendQuestion(ctx, question, type);
  }

  private async sendQuestion(
    ctx: Context,
    question: QuestionWithOptions,
    lessonType: TheoryLessonType,
  ) {
    const questionCaption = `❓ ${question.textPl}\n🇺🇿 ${question.textUz}`;

    if (question.mediaFileName && question.mediaType) {
      await this.sendQuestionMedia(ctx, question, questionCaption);
    } else {
      await ctx.reply(questionCaption);
    }

    const letters = ['A', 'B', 'C', 'D'];
    const optionLines = question.options
      .map((o, i) => `${letters[i]}) ${o.textPl}\n🇺🇿 ${o.textUz}`)
      .join('\n\n');
    await ctx.reply(optionLines, {
      reply_markup: {
        inline_keyboard: [
          question.options.map((o, i) => ({
            text: letters[i],
            callback_data: `QOPT:${question.id}:${o.id}:${lessonType}`,
          })),
        ],
      },
    });
  }

  private async sendQuestionMedia(
    ctx: Context,
    question: QuestionWithOptions,
    caption: string,
  ) {
    const source = question.telegramFileId
      ? question.telegramFileId
      : { source: createReadStream(join(THEORY_MEDIA_DIR, question.mediaFileName!)) };

    const message =
      question.mediaType === 'video'
        ? await ctx.replyWithVideo(source, { caption })
        : await ctx.replyWithPhoto(source, { caption });

    if (!question.telegramFileId) {
      const fileId =
        'video' in message ? message.video.file_id : message.photo.at(-1)!.file_id;
      await this.theoryService.cacheTelegramFileId(question.id, fileId);
    }
  }

  @Action(/^QOPT:([^:]+):([^:]+):(text|photo|video)$/)
  async onQuizAnswer(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    const [, questionId, optionId, lessonType] = ctx.match;
    const question = await this.theoryService.getQuestionWithOptions(questionId);
    const selected = question?.options.find((o) => o.id === optionId);
    const correct = question?.options.find((o) => o.isCorrect);
    await ctx
      .answerCbQuery(selected?.isCorrect ? "✅ To'g'ri!" : '❌ Noto\'g\'ri')
      .catch(() => {});
    const correctLine = correct ? `${correct.textPl}\n🇺🇿 ${correct.textUz}` : '';
    await ctx.reply(
      selected?.isCorrect
        ? "✅ To'g'ri javob!"
        : `❌ Noto'g'ri.\n\nTo'g'ri javob:\n${correctLine}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '➡️ Keyingi savol',
                callback_data: `THEORY_TYPE:${lessonType}`,
              },
            ],
            [BACK_TO_MAIN_BUTTON],
          ],
        },
      },
    );
  }

  // ---------- Yo'l belgilari ----------

  @Action('SIGNS_MENU')
  async onSignsMenu(@Ctx() ctx: Context) {
    await ctx.answerCbQuery().catch(() => {});
    const counts = await this.roadSignService.countByCategory();
    await ctx.reply("🚦 Yo'l belgilari — toifani tanlang:", {
      reply_markup: {
        inline_keyboard: [
          ...ROAD_SIGN_CATEGORIES.map((c) => [
            {
              text: `${c.icon} ${c.label}${counts.get(c.key) ? ` (${counts.get(c.key)})` : ''}`,
              callback_data: `SIGNS_CAT:${c.key}`,
            },
          ]),
          [BACK_TO_MAIN_BUTTON],
        ],
      },
    });
  }

  @Action(/^SIGNS_CAT:(.+)$/)
  async onSignsCategory(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    await ctx.answerCbQuery().catch(() => {});
    const category = ctx.match[1] as RoadSignCategoryKey;
    const signs = await this.roadSignService.listByCategory(category);
    if (signs.length === 0) {
      await ctx.reply("Bu toifada hozircha belgilar yo'q. Tez orada qo'shiladi.", {
        reply_markup: { inline_keyboard: [[BACK_TO_MAIN_BUTTON]] },
      });
      return;
    }
    await this.sendSign(ctx, signs[0].id);
  }

  private async sendSign(ctx: Context, signId: string) {
    const sign = await this.roadSignService.getById(signId);
    if (!sign) return;
    const siblings = await this.roadSignService.listByCategory(
      sign.category as RoadSignCategoryKey,
    );
    const index = siblings.findIndex((s) => s.id === sign.id);
    const caption = [
      sign.code ? `${sign.code}` : null,
      sign.namePl ? `🇵🇱 ${sign.namePl}` : null,
      `🇺🇿 ${sign.nameUz}`,
      sign.descriptionUz ?? null,
    ]
      .filter(Boolean)
      .join('\n');

    if (!sign.imageFileName) {
      await ctx.reply(caption);
    } else {
      const source = sign.telegramFileId
        ? sign.telegramFileId
        : { source: createReadStream(join(ROAD_SIGN_MEDIA_DIR, sign.imageFileName)) };
      const message = await ctx.replyWithPhoto(source, { caption });
      if (!sign.telegramFileId) {
        await this.roadSignService.cacheTelegramFileId(
          sign.id,
          message.photo.at(-1)!.file_id,
        );
      }
    }

    const nav: { text: string; callback_data: string }[] = [];
    if (index > 0) {
      nav.push({ text: '⬅️', callback_data: `SIGN:${siblings[index - 1].id}` });
    }
    nav.push({
      text: `${index + 1}/${siblings.length}`,
      callback_data: `SIGNS_CAT:${sign.category}`,
    });
    if (index < siblings.length - 1) {
      nav.push({ text: '➡️', callback_data: `SIGN:${siblings[index + 1].id}` });
    }
    await ctx.reply("Navigatsiya:", {
      reply_markup: {
        inline_keyboard: [nav, [{ text: "⬅️ Toifalar", callback_data: 'SIGNS_MENU' }, BACK_TO_MAIN_BUTTON]],
      },
    });
  }

  @Action(/^SIGN:(.+)$/)
  async onSign(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    await ctx.answerCbQuery().catch(() => {});
    await this.sendSign(ctx, ctx.match[1]);
  }
}
