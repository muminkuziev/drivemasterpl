import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TranslatorService } from '../translator/translator.service';
import { UsersService } from '../users/users.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

@Controller('api/translator')
@UseGuards(TelegramAuthGuard)
export class TranslatorWebController {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly usersService: UsersService,
  ) {}

  @Get('usage')
  async usage(@Query('telegramId') telegramId?: string) {
    if (!telegramId) throw new BadRequestException('telegramId talab qilinadi');
    const user = await this.usersService.findOrCreateByTelegramId(telegramId);
    return this.translatorService.getUsage(user);
  }

  @Post('translate')
  async translate(
    @Body()
    body: {
      telegramId?: string;
      audioBase64?: string;
      mimeType?: string;
      passengerLanguage?: string;
    },
  ) {
    if (!body.telegramId) throw new BadRequestException('telegramId talab qilinadi');
    if (!body.audioBase64 || !body.mimeType) {
      throw new BadRequestException('audioBase64 va mimeType majburiy');
    }
    if (!body.passengerLanguage) {
      throw new BadRequestException("passengerLanguage majburiy");
    }
    const user = await this.usersService.findOrCreateByTelegramId(body.telegramId);
    return this.translatorService.translate(user, body.audioBase64, body.mimeType, body.passengerLanguage);
  }
}
