import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    profile?: { username?: string; firstName?: string },
  ) {
    return this.prisma.user.upsert({
      where: { telegramId },
      update: { username: profile?.username, firstName: profile?.firstName },
      create: { telegramId, username: profile?.username, firstName: profile?.firstName },
    });
  }

  async listAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async setLanguage(id: string, languageCode: string) {
    return this.prisma.user.update({ where: { id }, data: { languageCode } });
  }

  async setPremium(id: string, isPremium: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isPremium, premiumSince: isPremium ? new Date() : null },
    });
  }

  async resetBoundDevice(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { boundDeviceId: null, boundDeviceAt: null },
    });
  }

  /**
   * Qurilma bog'lash — kriptografik jihatdan mustahkam emas (deviceId mijoz
   * tomonida localStorage'da saqlanadi, tozalansa chetlab o'tiladi). Bu shunchaki
   * oddiy ulashishning oldini oluvchi UX-to'siq, DRM-darajasidagi himoya emas.
   * Birinchi chaqiruvda bog'laydi, keyingisida mos kelmasa false qaytaradi.
   */
  async checkOrBindDevice(id: string, deviceId: string): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    if (!user.boundDeviceId) {
      await this.prisma.user.update({
        where: { id },
        data: { boundDeviceId: deviceId, boundDeviceAt: new Date() },
      });
      return true;
    }
    return user.boundDeviceId === deviceId;
  }
}
