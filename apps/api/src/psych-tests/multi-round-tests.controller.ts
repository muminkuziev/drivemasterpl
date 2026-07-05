import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MultiRoundTestsService, MultiRoundTestType } from './multi-round-tests.service';
import { TelegramAuthGuard } from '../webapp/telegram-auth.guard';

const VALID_TYPES: MultiRoundTestType[] = ['piorkowski', 'krzyzowy', 'signal'];

function requireType(type: string): MultiRoundTestType {
  if (!VALID_TYPES.includes(type as MultiRoundTestType)) {
    throw new BadRequestException(`Noma'lum test turi: "${type}"`);
  }
  return type as MultiRoundTestType;
}

function requireTelegramId(telegramId: unknown): string {
  if (typeof telegramId !== 'string' || !telegramId) {
    throw new BadRequestException('telegramId majburiy');
  }
  return telegramId;
}

@Controller('api/:testType')
@UseGuards(TelegramAuthGuard)
export class MultiRoundTestsController {
  constructor(private readonly service: MultiRoundTestsService) {}

  @Post('start')
  start(
    @Param('testType') testType: string,
    @Body() body: { telegramId?: string; deviceId?: string },
  ) {
    return this.service.start(requireTelegramId(body.telegramId), requireType(testType), body.deviceId);
  }

  @Post('round')
  round(
    @Param('testType') testType: string,
    @Body() body: { telegramId?: string; isCorrect?: boolean; reactionTimeMs?: number; [key: string]: unknown },
  ) {
    const { telegramId, isCorrect, reactionTimeMs, ...rest } = body;
    if (typeof reactionTimeMs !== 'number') {
      throw new BadRequestException('reactionTimeMs majburiy');
    }
    return this.service.addRound(requireTelegramId(telegramId), requireType(testType), {
      isCorrect: Boolean(isCorrect),
      reactionTimeMs,
      ...rest,
    });
  }

  @Post('finish')
  finish(@Param('testType') testType: string, @Body() body: { telegramId?: string }) {
    return this.service.finish(requireTelegramId(body.telegramId), requireType(testType));
  }

  @Get('last')
  last(@Param('testType') testType: string, @Query('telegramId') telegramId?: string) {
    return this.service.last(requireTelegramId(telegramId), requireType(testType));
  }
}
