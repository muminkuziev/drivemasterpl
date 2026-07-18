import { Controller, Get, Param } from '@nestjs/common';
import { WordCenterService } from '../content/word-center.service';

function shortLabel(voivodeship: string): string {
  return voivodeship.replace(/^Województwo\s+/i, '').trim();
}

@Controller('api/word-centers')
export class WordCentersWebController {
  constructor(private readonly wordCenterService: WordCenterService) {}

  @Get('voivodeships')
  async listVoivodeships() {
    const counts = await this.wordCenterService.countByVoivodeship();
    return [...counts.entries()]
      .map(([voivodeship, count]) => ({
        voivodeship,
        label: shortLabel(voivodeship),
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  @Get(':voivodeship')
  async listByVoivodeship(@Param('voivodeship') voivodeship: string) {
    const centers = await this.wordCenterService.listByVoivodeship(voivodeship);
    return centers.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      address: c.address,
      website: c.website,
    }));
  }
}
