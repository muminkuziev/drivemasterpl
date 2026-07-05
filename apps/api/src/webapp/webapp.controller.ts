import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { RoadSignService } from '../content/road-sign.service';
import {
  ROAD_SIGN_CATEGORIES,
  isRoadSignCategoryKey,
  RoadSignCategoryKey,
} from '../content/road-sign-categories';

const DEFAULT_ACTION_BY_CATEGORY: Record<RoadSignCategoryKey, (nameUz: string) => string> = {
  warning: (n) => `⚠️ Bu belgi "${n}" haqida ogohlantiradi. Tezlikni kamaytiring, ehtiyot bo'ling va yo'l holatiga alohida diqqat bering.`,
  prohibition: (n) => `⛔ Bu belgi "${n}"ni taqiqlaydi. Ko'rsatilgan harakatni bajarmang — bu jarima yoki xavfli holatga olib kelishi mumkin.`,
  mandatory: (n) => `🔵 Bu belgi "${n}"ni buyuradi. Ko'rsatilgan harakatni albatta bajaring.`,
  information: (n) => `ℹ️ Bu belgi "${n}" haqida ma'lumot beradi. Shunga qarab harakatingizni rejalashtiring.`,
  additional: (n) => `➕ Bu qo'shimcha taxtacha asosiy belgiga tegishli aniqlashtirish beradi: "${n}".`,
  direction: (n) => `🧭 Bu belgi "${n}" tomon yo'nalishni ko'rsatadi.`,
  traffic_light: (n) => `🚦 "${n}" — signalning ma'nosiga qarab harakat qiling: yashil o'tish, sariq tayyorlanish, qizil to'xtash.`,
  road_markings: (n) => `🛣️ Bu yo'l chizig'i "${n}"ni bildiradi. Chiziq turiga mos harakatlaning.`,
  traffic_controller: (n) => `👮 "${n}". Harakatni boshqaruvchi shaxsning ko'rsatmasi svetofordan ustun turadi — albatta unga bo'ysuning.`,
  dashboard: (n) => `🚗 Panelda "${n}" yonganda tegishli choralarni ko'ring (kerak bo'lsa to'xtab tekshiring).`,
};

function buildAction(category: RoadSignCategoryKey, nameUz: string, actionUz: string | null): string {
  if (actionUz) return actionUz;
  return DEFAULT_ACTION_BY_CATEGORY[category](nameUz);
}

@Controller('api/road-signs')
export class WebappController {
  constructor(private readonly roadSignService: RoadSignService) {}

  @Get('categories')
  async listCategories() {
    const counts = await this.roadSignService.countByCategory();
    return ROAD_SIGN_CATEGORIES.map((c) => ({
      key: c.key,
      icon: c.icon,
      label: c.label,
      count: counts.get(c.key) ?? 0,
    }));
  }

  @Get('sign/:id')
  async getSign(@Param('id') id: string) {
    const sign = await this.roadSignService.getById(id);
    if (!sign) throw new NotFoundException("Belgi topilmadi");
    const category = sign.category as RoadSignCategoryKey;
    return {
      id: sign.id,
      code: sign.code,
      category,
      namePl: sign.namePl,
      nameUz: sign.nameUz,
      nameRu: sign.nameRu,
      nameEn: sign.nameEn,
      descriptionUz: sign.descriptionUz,
      descriptionRu: sign.descriptionRu,
      descriptionEn: sign.descriptionEn,
      actionUz: buildAction(category, sign.nameUz, sign.actionUz),
      actionRu: sign.actionRu,
      actionEn: sign.actionEn,
      imageUrl: sign.imageFileName ? `/media/signs/${sign.imageFileName}` : null,
    };
  }

  @Get(':category')
  async listByCategory(@Param('category') category: string) {
    if (!isRoadSignCategoryKey(category)) {
      throw new NotFoundException(`Noma'lum toifa: "${category}"`);
    }
    const signs = await this.roadSignService.listByCategory(category);
    return signs.map((s) => ({
      id: s.id,
      code: s.code,
      namePl: s.namePl,
      nameUz: s.nameUz,
      nameRu: s.nameRu,
      nameEn: s.nameEn,
      descriptionUz: s.descriptionUz,
      descriptionRu: s.descriptionRu,
      descriptionEn: s.descriptionEn,
      imageUrl: s.imageFileName ? `/media/signs/${s.imageFileName}` : null,
    }));
  }
}
