import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PsychTestsService } from './psych-tests.service';
import { TelegramAuthGuard } from '../webapp/telegram-auth.guard';

function requireTelegramId(telegramId: unknown): string {
  if (typeof telegramId !== 'string' || !telegramId) {
    throw new BadRequestException('telegramId majburiy');
  }
  return telegramId;
}

@Controller('api')
@UseGuards(TelegramAuthGuard)
export class PsychTestsController {
  constructor(private readonly psychTests: PsychTestsService) {}

  // ---------- Koordinatsiya testi ----------

  @Post('coordination/start')
  coordinationStart(@Body() body: { telegramId?: string; deviceId?: string }) {
    return this.psychTests.coordinationStart(requireTelegramId(body.telegramId), body.deviceId);
  }

  @Post('coordination/move')
  coordinationMove(@Body() body: { telegramId?: string; outOfLine?: boolean }) {
    return this.psychTests.coordinationMove(
      requireTelegramId(body.telegramId),
      Boolean(body.outOfLine),
    );
  }

  @Post('coordination/finish')
  coordinationFinish(@Body() body: { telegramId?: string }) {
    return this.psychTests.coordinationFinish(requireTelegramId(body.telegramId));
  }

  @Get('coordination/last')
  coordinationLast(@Query('telegramId') telegramId?: string) {
    return this.psychTests.coordinationLast(requireTelegramId(telegramId));
  }

  // ---------- Diqqat testi ----------

  @Post('attention/start')
  attentionStart(@Body() body: { telegramId?: string; deviceId?: string }) {
    return this.psychTests.attentionStart(requireTelegramId(body.telegramId), body.deviceId);
  }

  @Post('attention/click')
  attentionClick(@Body() body: { telegramId?: string; isCorrect?: boolean }) {
    return this.psychTests.attentionClick(
      requireTelegramId(body.telegramId),
      Boolean(body.isCorrect),
    );
  }

  @Post('attention/finish')
  attentionFinish(@Body() body: { telegramId?: string }) {
    return this.psychTests.attentionFinish(requireTelegramId(body.telegramId));
  }

  @Get('attention/last')
  attentionLast(@Query('telegramId') telegramId?: string) {
    return this.psychTests.attentionLast(requireTelegramId(telegramId));
  }

  // ---------- Reaksiya testi ----------

  @Post('reaction/start')
  reactionStart(@Body() body: { telegramId?: string; deviceId?: string }) {
    return this.psychTests.reactionStart(requireTelegramId(body.telegramId), body.deviceId);
  }

  @Post('reaction/result')
  reactionResult(
    @Body() body: { telegramId?: string; reactionTimeMs?: number; deviceId?: string },
  ) {
    if (typeof body.reactionTimeMs !== 'number') {
      throw new BadRequestException('reactionTimeMs majburiy');
    }
    return this.psychTests.reactionResult(
      requireTelegramId(body.telegramId),
      body.reactionTimeMs,
      body.deviceId,
    );
  }

  @Get('reaction/last')
  reactionLast(@Query('telegramId') telegramId?: string) {
    return this.psychTests.reactionLast(requireTelegramId(telegramId));
  }
}
