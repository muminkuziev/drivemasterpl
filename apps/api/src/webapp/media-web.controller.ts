import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream, statSync } from 'fs';
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
    @Headers('range') range: string | undefined,
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
    const { size } = statSync(filePath);
    res.set({ 'Content-Type': contentType, 'Accept-Ranges': 'bytes' });

    // Range so'rovi (video seeking va katta fayllarni ishonchli, bo'lib-bo'lib
    // uzatish uchun kerak — Content-Length'siz oqim ba'zi proksi/brauzerlarda
    // rasm/video "to'liq yuklanmagan" holatga olib kelishi mumkin edi).
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match?.[1] ? parseInt(match[1], 10) : 0;
      const end = match?.[2] ? parseInt(match[2], 10) : size - 1;
      const chunkSize = end - start + 1;
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(chunkSize),
      });
      return new StreamableFile(createReadStream(filePath, { start, end }));
    }

    res.set({ 'Content-Length': String(size) });
    return new StreamableFile(createReadStream(filePath));
  }
}
