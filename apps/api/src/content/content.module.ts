import { Module } from '@nestjs/common';
import { TheoryService } from './theory.service';
import { RoadSignService } from './road-sign.service';

@Module({
  providers: [TheoryService, RoadSignService],
  exports: [TheoryService, RoadSignService],
})
export class ContentModule {}
