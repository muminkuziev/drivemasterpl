import { Module } from '@nestjs/common';
import { TheoryService } from './theory.service';
import { RoadSignService } from './road-sign.service';
import { WordCenterService } from './word-center.service';

@Module({
  providers: [TheoryService, RoadSignService, WordCenterService],
  exports: [TheoryService, RoadSignService, WordCenterService],
})
export class ContentModule {}
