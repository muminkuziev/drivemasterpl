import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';

export function isAdmin(ctx: Context, config: ConfigService): boolean {
  const adminIds = (config.get<string>('ADMIN_TELEGRAM_IDS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.includes(String(ctx.from?.id));
}
