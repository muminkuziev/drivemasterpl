import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { BotModule } from './bot/bot.module';
import { AdminModule } from './admin/admin.module';
import { WebappModule } from './webapp/webapp.module';
import { PsychTestsModule } from './psych-tests/psych-tests.module';
import { MEDIA_ROOT_DIR } from './content/media-root.util';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot(
      { rootPath: MEDIA_ROOT_DIR, serveRoot: '/media' },
      { rootPath: join(__dirname, '..', '..', 'public') },
    ),
    PrismaModule,
    BotModule,
    AdminModule,
    WebappModule,
    PsychTestsModule,
  ],
})
export class AppModule {}
