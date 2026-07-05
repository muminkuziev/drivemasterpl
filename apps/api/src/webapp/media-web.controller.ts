import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { lookup as lookupMimeType } from 'mime-types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { THEORY_MEDIA_DIR } from '../content/theory-media-dir.util';
import { TelegramAuthGuard } from './telegram-auth.guard';

@Controller('api/media')
@UseGuards(TelegramAuthGuard)
export class MediaWebController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get('theory/:questionId')
  async getTheoryMedia(
    @Param('questionId') questionId: string,
    @Query('telegramId') telegramId: string | undefined,
    @Query('deviceId') deviceId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const question = await this.prisma.theoryQuestion.findUnique({ where: { id: questionId } });
    if (!question || !question.mediaFileName) throw new NotFoundException('Media topilmadi');

    if (question.isPremium) {
      if (!telegramId) throw new ForbiddenException('telegramId talab qilinadi');
      const user = await this.usersService.findOrCreateByTelegramId(telegramId);
      if (!user.isPremium) throw new ForbiddenException('Bu premium kontent');
      if (!deviceId) throw new ForbiddenException('deviceId talab qilinadi');
      const deviceOk = await this.usersService.checkOrBindDevice(user.id, deviceId);
      if (!deviceOk) throw new ForbiddenException("Boshqa qurilmada ochib bo'lmaydi");
    }

    const filePath = join(THEORY_MEDIA_DIR, question.mediaFileName);
    const contentType = lookupMimeType(filePath) || 'application/octet-stream';
    res.set({ 'Content-Type': contentType });
    return new StreamableFile(createReadStream(filePath));
  }
}
