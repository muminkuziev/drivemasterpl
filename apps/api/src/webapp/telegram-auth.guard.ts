import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

/**
 * Telegram WebApp'ning initData imzosini bot tokeni bilan tekshiradi
 * (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).
 * Muvaffaqiyatli bo'lsa, tasdiqlangan telegramId bilan request.body/query'ni qayta yozadi —
 * shu orqali mijoz o'zi yuborgan telegramId'ga ishonilmaydi, faqat Telegram imzolagan ID'ga ishoniladi.
 * Haqiqiy initData yo'q bo'lsa (masalan localhost'da brauzer orqali test qilinganda) va NODE_ENV
 * production bo'lmasa, mijoz yuborgan telegramId'ga ishonib davom etiladi (dev fallback).
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const initData = request.headers['x-telegram-init-data'];

    if (typeof initData === 'string' && initData.length > 0) {
      const telegramId = this.verifyInitData(initData);
      if (!telegramId) {
        throw new UnauthorizedException("Telegram autentifikatsiyasi noto'g'ri yoki eskirgan");
      }
      this.overrideTelegramId(request, telegramId);
      return true;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Telegram initData talab qilinadi');
    }

    return true;
  }

  private overrideTelegramId(request: Request, telegramId: string) {
    if (request.body && typeof request.body === 'object') {
      (request.body as Record<string, unknown>).telegramId = telegramId;
    }
    if (request.query && typeof request.query === 'object') {
      (request.query as Record<string, unknown>).telegramId = telegramId;
    }
  }

  private verifyInitData(initData: string): string | null {
    const botToken = this.config.get<string>('BOT_TOKEN');
    if (!botToken) return null;

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const hashBuf = Buffer.from(hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (hashBuf.length !== computedBuf.length || !timingSafeEqual(hashBuf, computedBuf)) {
      return null;
    }

    const authDate = Number(params.get('auth_date'));
    if (!authDate || Date.now() / 1000 - authDate > MAX_INIT_DATA_AGE_SECONDS) {
      return null;
    }

    const userRaw = params.get('user');
    if (!userRaw) return null;
    try {
      const user = JSON.parse(userRaw) as { id?: number };
      return user.id ? String(user.id) : null;
    } catch {
      return null;
    }
  }
}
