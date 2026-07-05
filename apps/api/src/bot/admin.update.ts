import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ContentImportService } from '../admin/content-import.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { isAdmin } from './is-admin.util';

const IMPORT_CATEGORIES: Record<
  string,
  { label: string; method: keyof ContentImportService }
> = {
  cities: { label: 'Shaharlar', method: 'importCities' },
  'psych-centers': { label: 'Psixolog markazlar', method: 'importPsychCenters' },
  instructors: { label: 'Instruktorlar', method: 'importInstructors' },
  'theory-questions': {
    label: 'Teoriya savollari',
    method: 'importTheoryQuestions',
  },
  'psych-questions': {
    label: 'Psixologik savollar',
    method: 'importPsychQuestions',
  },
  'theory-videos': { label: 'Videolar', method: 'importTheoryVideos' },
  'road-signs': { label: "Yo'l belgilari", method: 'importRoadSigns' },
};

@Update()
export class AdminUpdate {
  // telegramId -> pending uploaded file_id kutayotgan turini tanlashdan oldin
  private readonly pendingFiles = new Map<string, string>();

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly contentImport: ContentImportService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private async sendAdminMenu(ctx: Context) {
    await ctx.reply('🛠 Admin panel', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👥 Foydalanuvchilar', callback_data: 'ADMIN_USERS' }],
          [{ text: "💳 Kutilayotgan to'lovlar", callback_data: 'ADMIN_PAYMENTS' }],
          [{ text: '📥 Kontent yuklash', callback_data: 'ADMIN_IMPORT_HELP' }],
        ],
      },
    });
  }

  @Command('admin')
  async onAdminCommand(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    await this.sendAdminMenu(ctx);
  }

  @Action('ADMIN_MENU')
  async onAdminMenu(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    await ctx.answerCbQuery().catch(() => {});
    await this.sendAdminMenu(ctx);
  }

  @Action('ADMIN_USERS')
  async onAdminUsers(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    await ctx.answerCbQuery().catch(() => {});
    const users = await this.usersService.listAll();
    if (users.length === 0) {
      await ctx.reply("Hozircha foydalanuvchi yo'q.");
      return;
    }
    for (const u of users.slice(0, 20)) {
      const nameLine = [u.firstName, u.username ? `@${u.username}` : null].filter(Boolean).join(' ');
      await ctx.reply(
        `👤 ${nameLine || "(ismi noma'lum)"}\nTelegram ID: ${u.telegramId}\nPremium: ${u.isPremium ? '✅' : '—'}\nQurilma: ${u.boundDeviceId ? '🔒 bog\'langan' : '—'}\nRo'yxatdan o'tgan: ${u.createdAt.toLocaleDateString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: u.isPremium
                    ? '❌ Premiumni bekor qilish'
                    : '✅ Premium berish',
                  callback_data: `${u.isPremium ? 'AR' : 'AG'}:${u.id}`,
                },
              ],
              [{ text: "🔓 Qurilmani tiklash", callback_data: `RESET_DEV:${u.id}` }],
            ],
          },
        },
      );
    }
  }

  @Action(/^AG:(.+)$/)
  async onGrantPremium(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await this.usersService.setPremium(ctx.match[1], true);
    await ctx.answerCbQuery('Premium berildi ✅').catch(() => {});
  }

  @Action(/^AR:(.+)$/)
  async onRevokePremium(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await this.usersService.setPremium(ctx.match[1], false);
    await ctx.answerCbQuery('Premium bekor qilindi').catch(() => {});
  }

  @Action(/^RESET_DEV:(.+)$/)
  async onResetDevice(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await this.usersService.resetBoundDevice(ctx.match[1]);
    await ctx.answerCbQuery("Qurilma bog'lovi tozalandi 🔓").catch(() => {});
  }

  @Action('ADMIN_PAYMENTS')
  async onAdminPayments(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    await ctx.answerCbQuery().catch(() => {});
    const pending = await this.paymentsService.listPending();
    if (pending.length === 0) {
      await ctx.reply("Hozircha kutilayotgan to'lov yo'q.");
      return;
    }
    for (const p of pending.slice(0, 20)) {
      const nameLine = [p.user.firstName, p.user.username ? `@${p.user.username}` : null]
        .filter(Boolean)
        .join(' ');
      await ctx.reply(
        `👤 ${nameLine || "(ismi noma'lum)"}\nTelegram ID: ${p.user.telegramId}\n📞 Telefon: ${p.senderPhone ?? '—'}\n💰 Summa: ${(p.amount / 100).toFixed(2)} ${p.currency}\n🕐 So'ralgan: ${p.createdAt.toLocaleString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Tasdiqlash', callback_data: `PAY_OK:${p.id}` },
                { text: '❌ Rad etish', callback_data: `PAY_NO:${p.id}` },
              ],
            ],
          },
        },
      );
    }
  }

  @Action(/^PAY_OK:(.+)$/)
  async onApprovePayment(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await this.paymentsService.approve(ctx.match[1], String(ctx.from!.id));
    await ctx.answerCbQuery("To'lov tasdiqlandi, premium yoqildi ✅").catch(() => {});
  }

  @Action(/^PAY_NO:(.+)$/)
  async onRejectPayment(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await this.paymentsService.reject(ctx.match[1], String(ctx.from!.id));
    await ctx.answerCbQuery("To'lov rad etildi").catch(() => {});
  }

  @Action('ADMIN_IMPORT_HELP')
  async onImportHelp(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    await ctx.answerCbQuery().catch(() => {});
    await ctx.reply(
      '📥 Kontent yuklash uchun JSON faylni shu chatga hujjat (fayl) sifatida yuboring. Fayl kelgach, qaysi turdagi kontent ekanligini tanlaysiz.',
    );
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    if (!isAdmin(ctx, this.config)) return;
    const message = ctx.message as { document?: { file_id: string; file_name?: string } };
    const doc = message.document;
    if (!doc) return;
    if (!doc.file_name?.endsWith('.json')) {
      await ctx.reply('Faqat .json fayl qabul qilinadi.');
      return;
    }
    this.pendingFiles.set(String(ctx.from!.id), doc.file_id);
    await ctx.reply("Fayl qabul qilindi. Qaysi turdagi kontent?", {
      reply_markup: {
        inline_keyboard: Object.entries(IMPORT_CATEGORIES).map(([key, v]) => [
          { text: v.label, callback_data: `AIMPORT:${key}` },
        ]),
      },
    });
  }

  @Action(/^AIMPORT:(.+)$/)
  async onImportCategory(@Ctx() ctx: Context & { match: RegExpExecArray }) {
    if (!isAdmin(ctx, this.config)) return;
    await ctx.answerCbQuery().catch(() => {});
    const category = IMPORT_CATEGORIES[ctx.match[1]];
    const fileId = this.pendingFiles.get(String(ctx.from!.id));
    if (!category || !fileId) {
      await ctx.reply('Fayl topilmadi, qaytadan yuboring.');
      return;
    }
    try {
      const link = await ctx.telegram.getFileLink(fileId);
      const response = await fetch(link.toString());
      const json = await response.json();
      const method = this.contentImport[category.method].bind(this.contentImport);
      const result = await (method as (items: unknown) => Promise<{ imported: number }>)(json);
      await ctx.reply(`✅ ${category.label}: ${result.imported} ta yozuv import qilindi.`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Nomaʼlum xatolik';
      await ctx.reply(`❌ Xatolik: ${message}`);
    } finally {
      this.pendingFiles.delete(String(ctx.from!.id));
    }
  }
}
