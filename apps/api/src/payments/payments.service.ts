import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const PREMIUM_PRICE_GROSZ = 7700; // 77 PLN

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createPendingRequest(userId: string, phone: string) {
    const existing = await this.prisma.payment.findFirst({
      where: { userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    return this.prisma.payment.create({
      data: {
        userId,
        provider: 'manual-blik',
        amount: PREMIUM_PRICE_GROSZ,
        currency: 'PLN',
        status: 'pending',
        senderPhone: phone,
      },
    });
  }

  async getLatestForUser(userId: string) {
    return this.prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPending() {
    return this.prisma.payment.findMany({
      where: { status: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(id: string, adminTelegramId: string) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'succeeded', reviewedByTelegramId: adminTelegramId, reviewedAt: new Date() },
    });
    await this.usersService.setPremium(payment.userId, true);
    return payment;
  }

  async reject(id: string, adminTelegramId: string, note?: string) {
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'failed', reviewedByTelegramId: adminTelegramId, reviewedAt: new Date(), note },
    });
  }
}
