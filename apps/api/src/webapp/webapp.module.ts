import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { TranslatorModule } from '../translator/translator.module';
import { WebappController } from './webapp.controller';
import { TheoryWebController } from './theory-web.controller';
import { ProfileWebController } from './profile-web.controller';
import { PaymentsWebController } from './payments-web.controller';
import { MediaWebController } from './media-web.controller';
import { TranslatorWebController } from './translator-web.controller';
import { WordCentersWebController } from './word-centers-web.controller';

@Module({
  imports: [ContentModule, UsersModule, PaymentsModule, TranslatorModule],
  controllers: [
    WebappController,
    TheoryWebController,
    ProfileWebController,
    PaymentsWebController,
    MediaWebController,
    TranslatorWebController,
    WordCentersWebController,
  ],
})
export class WebappModule {}
