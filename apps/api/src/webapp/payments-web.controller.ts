import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

@Controller('api/payments')
@UseGuards(TelegramAuthGuard)
export class PaymentsWebController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('request-premium')
  async requestPremium(@Body() body: { telegramId?: string; phone?: string }) {
    if (!body.telegramId) throw new BadRequestException('telegramId talab qilinadi');
    if (!body.phone) throw new BadRequestException('phone talab qilinadi');
    const user = await this.usersService.findOrCreateByTelegramId(body.telegramId);
    return this.paymentsService.createPendingRequest(user.id, body.phone);
  }

  @Get('my-status')
  async myStatus(@Query('telegramId') telegramId?: string) {
    if (!telegramId) throw new BadRequestException('telegramId talab qilinadi');
    const user = await this.usersService.findOrCreateByTelegramId(telegramId);
    return this.paymentsService.getLatestForUser(user.id);
  }
}
