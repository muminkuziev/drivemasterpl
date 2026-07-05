import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PaymentsService } from './payments.service';

@Module({
  imports: [UsersModule],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
