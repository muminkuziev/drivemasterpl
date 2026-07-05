import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { WebappController } from './webapp.controller';
import { TheoryWebController } from './theory-web.controller';
import { ProfileWebController } from './profile-web.controller';
import { PaymentsWebController } from './payments-web.controller';
import { MediaWebController } from './media-web.controller';

@Module({
  imports: [ContentModule, UsersModule, PaymentsModule],
  controllers: [
    WebappController,
    TheoryWebController,
    ProfileWebController,
    PaymentsWebController,
    MediaWebController,
  ],
})
export class WebappModule {}
