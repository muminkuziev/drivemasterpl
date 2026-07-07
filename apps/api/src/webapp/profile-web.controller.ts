import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

@Controller('api/profile')
@UseGuards(TelegramAuthGuard)
export class ProfileWebController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async getProfile(@Query('telegramId') telegramId?: string) {
    if (!telegramId) throw new BadRequestException('telegramId talab qilinadi');
    const user = await this.usersService.findOrCreateByTelegramId(telegramId);
    return {
      telegramId: user.telegramId,
      isPremium: user.isPremium,
      premiumSince: user.premiumSince,
      createdAt: user.createdAt,
      premiumPriceGrosz: 6600,
      blikPhone: this.config.get<string>('ADMIN_BLIK_PHONE') || null,
    };
  }
}
