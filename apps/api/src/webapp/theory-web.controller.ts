import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { TheoryService, TheoryLessonType } from '../content/theory.service';
import { UsersService } from '../users/users.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

const VALID_TYPES: TheoryLessonType[] = ['text', 'photo', 'video'];

@Controller('api/theory')
@UseGuards(TelegramAuthGuard)
export class TheoryWebController {
  constructor(
    private readonly theoryService: TheoryService,
    private readonly usersService: UsersService,
  ) {}

  @Get('categories')
  async categories(@Query('type') type?: string) {
    if (!type || !VALID_TYPES.includes(type as TheoryLessonType)) {
      throw new BadRequestException("type: 'text' | 'photo' | 'video' bo'lishi kerak");
    }
    return this.theoryService.listCategoriesForType(type as TheoryLessonType);
  }

  @Get('random')
  async random(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('telegramId') telegramId?: string,
  ) {
    if (!type || !VALID_TYPES.includes(type as TheoryLessonType)) {
      throw new BadRequestException("type: 'text' | 'photo' | 'video' bo'lishi kerak");
    }
    if (!telegramId) throw new BadRequestException('telegramId talab qilinadi');
    const user = await this.usersService.findOrCreateByTelegramId(telegramId);
    const question = await this.theoryService.getRandomQuestionByType(
      type as TheoryLessonType,
      category || undefined,
      user.isPremium,
    );
    if (!question) {
      throw new NotFoundException("Bu turdagi savollar hozircha yo'q");
    }
    return {
      id: question.id,
      textPl: question.textPl,
      textUz: question.textUz,
      textRu: question.textRu,
      textEn: question.textEn,
      category: question.category,
      mediaType: question.mediaType,
      imageUrl: question.mediaFileName ? `/api/media/theory/${question.id}` : null,
      options: question.options.map((o) => ({
        id: o.id,
        textPl: o.textPl,
        textUz: o.textUz,
        textRu: o.textRu,
        textEn: o.textEn,
      })),
    };
  }

  @Post('answer')
  async answer(@Body() body: { questionId?: string; optionId?: string }) {
    if (!body.questionId || !body.optionId) {
      throw new BadRequestException('questionId va optionId majburiy');
    }
    const question = await this.theoryService.getQuestionWithOptions(body.questionId);
    if (!question) throw new NotFoundException('Savol topilmadi');
    const selected = question.options.find((o) => o.id === body.optionId);
    const correct = question.options.find((o) => o.isCorrect);
    return {
      isCorrect: Boolean(selected?.isCorrect),
      correctOption: correct
        ? {
            id: correct.id,
            textPl: correct.textPl,
            textUz: correct.textUz,
            textRu: correct.textRu,
            textEn: correct.textEn,
          }
        : null,
    };
  }
}
