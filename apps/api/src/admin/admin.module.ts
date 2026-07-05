import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminTokenGuard } from './admin-token.guard';
import { ContentImportService } from './content-import.service';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [AdminTokenGuard, ContentImportService],
  exports: [ContentImportService],
})
export class AdminModule {}
