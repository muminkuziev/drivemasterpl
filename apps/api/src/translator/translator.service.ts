import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface TranslateResult {
  originalText: string;
  detectedLang: string;
  translatedText: string;
  targetLang: string;
  audioBase64: string;
}

export interface TranslatorUsage {
  isPremium: boolean;
  used: number;
  limit: number;
  remaining: number;
}

const DEFAULT_STT_MODEL = 'gpt-4o-mini-transcribe';
const DEFAULT_LLM_MODEL = 'gpt-4o-mini';
const DEFAULT_TTS_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_FREE_TOTAL_LIMIT = 3;
const DEFAULT_PREMIUM_DAILY_LIMIT = 20;

// OpenAI Whisper/transkripsiya javobidagi `language` maydoni to'liq ingliz
// nomi bo'lib keladi ("english", "russian" va h.k.), ISO kod emas — shu
// yerda haydovchi tili (uz/ru/en, bot'dan) va yo'lovchi tili (frontend
// dropdown kodlari) bilan solishtirish uchun ISO 639-1'ga o'giramiz.
const WHISPER_LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  english: 'en',
  russian: 'ru',
  uzbek: 'uz',
  polish: 'pl',
  ukrainian: 'uk',
  german: 'de',
  french: 'fr',
  spanish: 'es',
  italian: 'it',
  turkish: 'tr',
  arabic: 'ar',
  chinese: 'zh',
};

function todayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class TranslatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get enabled(): boolean {
    return this.config.get<string>('TRANSLATOR_ENABLED') !== 'false';
  }

  private get apiKey(): string {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (!key) throw new ServiceUnavailableException("AI Tarjimon hozircha sozlanmagan");
    return key;
  }

  private premiumDailyLimit(): number {
    return Number(this.config.get<string>('TRANSLATOR_PREMIUM_DAILY_LIMIT')) || DEFAULT_PREMIUM_DAILY_LIMIT;
  }

  private freeTotalLimit(): number {
    return Number(this.config.get<string>('TRANSLATOR_FREE_TOTAL_LIMIT')) || DEFAULT_FREE_TOTAL_LIMIT;
  }

  async getUsage(user: User): Promise<TranslatorUsage> {
    if (user.isPremium) {
      const limit = this.premiumDailyLimit();
      const used = user.translatorDailyDate === todayBucket() ? user.translatorDailyCount : 0;
      return { isPremium: true, used, limit, remaining: Math.max(0, limit - used) };
    }
    const limit = this.freeTotalLimit();
    return {
      isPremium: false,
      used: user.translatorFreeUsed,
      limit,
      remaining: Math.max(0, limit - user.translatorFreeUsed),
    };
  }

  private async checkAndConsumeQuota(user: User): Promise<void> {
    if (!this.enabled) {
      throw new ForbiddenException({ statusCode: 403, code: 'TRANSLATOR_DISABLED' });
    }

    if (user.isPremium) {
      const limit = this.premiumDailyLimit();
      const today = todayBucket();
      const used = user.translatorDailyDate === today ? user.translatorDailyCount : 0;
      if (used >= limit) {
        throw new ForbiddenException({ statusCode: 403, code: 'DAILY_LIMIT_EXCEEDED', limit });
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { translatorDailyDate: today, translatorDailyCount: used + 1 },
      });
      return;
    }

    const limit = this.freeTotalLimit();
    if (user.translatorFreeUsed >= limit) {
      throw new ForbiddenException({ statusCode: 403, code: 'FREE_LIMIT_EXCEEDED', limit });
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { translatorFreeUsed: user.translatorFreeUsed + 1 },
    });
  }

  async translate(
    user: User,
    audioBase64: string,
    mimeType: string,
    passengerLanguage: string,
  ): Promise<TranslateResult> {
    await this.checkAndConsumeQuota(user);

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const { text: originalText, detectedLang } = await this.transcribe(audioBuffer, mimeType);

    const driverLang = (user.languageCode || 'uz').toLowerCase();
    const targetLang = detectedLang === driverLang ? passengerLanguage : driverLang;

    const translatedText = await this.translateText(originalText, detectedLang, targetLang);
    const audioBase64Out = await this.synthesizeSpeech(translatedText);

    return { originalText, detectedLang, translatedText, targetLang, audioBase64: audioBase64Out };
  }

  private async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
  ): Promise<{ text: string; detectedLang: string }> {
    const model = this.config.get<string>('TRANSLATOR_STT_MODEL') || DEFAULT_STT_MODEL;
    const ext = mimeType.includes('mp4') || mimeType.includes('m4a')
      ? 'm4a'
      : mimeType.includes('wav')
        ? 'wav'
        : mimeType.includes('mpeg') || mimeType.includes('mp3')
          ? 'mp3'
          : 'webm';

    const form = new FormData();
    form.append('file', new Blob([Uint8Array.from(audioBuffer)], { type: mimeType }), `voice.${ext}`);
    form.append('model', model);
    form.append('response_format', 'verbose_json');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(`Nutqni tanish xatosi: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { text: string; language?: string };
    const languageName = (data.language || '').toLowerCase();
    const detectedLang = WHISPER_LANGUAGE_NAME_TO_CODE[languageName] || languageName.slice(0, 2) || 'en';
    return { text: data.text, detectedLang };
  }

  private async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    const model = this.config.get<string>('TRANSLATOR_LLM_MODEL') || DEFAULT_LLM_MODEL;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              `Siz professional tarjimonsiz. Foydalanuvchi matnini "${fromLang}" tilidan "${toLang}" ` +
              "tiliga tarjima qiling. Faqat tarjimani qaytaring — hech qanday izoh, tushuntirish yoki " +
              "qo'shimcha matn yozmang.",
          },
          { role: 'user', content: text },
        ],
      }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(`Tarjima xatosi: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message?.content?.trim() || text;
  }

  private async synthesizeSpeech(text: string): Promise<string> {
    const model = this.config.get<string>('TRANSLATOR_TTS_MODEL') || DEFAULT_TTS_MODEL;
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, voice: 'alloy', input: text, response_format: 'mp3' }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(`Ovoz yaratish xatosi: ${res.status} ${await res.text()}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  }
}
