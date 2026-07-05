import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AdminModule } from '../admin/admin.module';
import { ContentModule } from '../content/content.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminUpdate } from './admin.update';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow<string>('BOT_TOKEN'),
      }),
    }),
    UsersModule,
    AdminModule,
    ContentModule,
    PaymentsModule,
  ],
  providers: [BotUpdate, AdminUpdate],
})
export class BotModule {}
