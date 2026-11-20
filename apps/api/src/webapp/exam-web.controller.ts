import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ExamService } from '../exam/exam.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

function requireTelegramId(id?: string): string {
  if (!id) throw new BadRequestException('telegramId talab qilinadi');
  return id;
}

@Controller('api/exam')
@UseGuards(TelegramAuthGuard)
export class ExamWebController {
  constructor(private readonly exam: ExamService) {}

  @Post('start')
  start(@Body() body: { telegramId?: string; mode?: string }) {
    const mode = body.mode === 'practice' ? 'practice' : 'exam';
    return this.exam.start(requireTelegramId(body.telegramId), mode);
  }

  @Get('history')
  history(@Query('telegramId') telegramId?: string) {
    return this.exam.history(requireTelegramId(telegramId));
  }

  @Get(':id')
  get(@Param('id') id: string, @Query('telegramId') telegramId?: string) {
    return this.exam.getForUser(requireTelegramId(telegramId), id);
  }

  @Post(':id/answer')
  answer(
    @Param('id') id: string,
    @Body() body: { telegramId?: string; questionId?: string; optionId?: string },
  ) {
    if (!body.questionId || !body.optionId) throw new BadRequestException('questionId va optionId majburiy');
    return this.exam.answer(requireTelegramId(body.telegramId), id, body.questionId, body.optionId);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() body: { telegramId?: string; questionId?: string }) {
    if (!body.questionId) throw new BadRequestException('questionId majburiy');
    return this.exam.confirm(requireTelegramId(body.telegramId), id, body.questionId);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string, @Body() body: { telegramId?: string }) {
    return this.exam.finish(requireTelegramId(body.telegramId), id);
  }
}
