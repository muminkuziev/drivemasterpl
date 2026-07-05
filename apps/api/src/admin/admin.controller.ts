import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdminTokenGuard } from './admin-token.guard';
import { ContentImportService } from './content-import.service';

@UseGuards(AdminTokenGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly contentImport: ContentImportService,
  ) {}

  @Get('users')
  listUsers() {
    return this.usersService.listAll();
  }

  @Post('users/:id/grant-premium')
  grantPremium(@Param('id') id: string) {
    return this.usersService.setPremium(id, true);
  }

  @Post('users/:id/revoke-premium')
  revokePremium(@Param('id') id: string) {
    return this.usersService.setPremium(id, false);
  }

  @Post('import/cities')
  importCities(@Body() body: unknown) {
    return this.contentImport.importCities(body);
  }

  @Post('import/psych-centers')
  importPsychCenters(@Body() body: unknown) {
    return this.contentImport.importPsychCenters(body);
  }

  @Post('import/instructors')
  importInstructors(@Body() body: unknown) {
    return this.contentImport.importInstructors(body);
  }

  @Post('import/theory-questions')
  importTheoryQuestions(@Body() body: unknown) {
    return this.contentImport.importTheoryQuestions(body);
  }

  @Post('import/psych-questions')
  importPsychQuestions(@Body() body: unknown) {
    return this.contentImport.importPsychQuestions(body);
  }

  @Post('import/theory-videos')
  importTheoryVideos(@Body() body: unknown) {
    return this.contentImport.importTheoryVideos(body);
  }

  @Post('import/road-signs')
  importRoadSigns(@Body() body: unknown) {
    return this.contentImport.importRoadSigns(body);
  }
}
