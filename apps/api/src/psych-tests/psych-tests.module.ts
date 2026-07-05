import { Module } from '@nestjs/common';
import { PsychTestsController } from './psych-tests.controller';
import { PsychTestsService } from './psych-tests.service';
import { MultiRoundTestsController } from './multi-round-tests.controller';
import { MultiRoundTestsService } from './multi-round-tests.service';

@Module({
  controllers: [PsychTestsController, MultiRoundTestsController],
  providers: [PsychTestsService, MultiRoundTestsService],
})
export class PsychTestsModule {}
