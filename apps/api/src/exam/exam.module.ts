import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ExamService } from './exam.service';

@Module({
  imports: [UsersModule],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
