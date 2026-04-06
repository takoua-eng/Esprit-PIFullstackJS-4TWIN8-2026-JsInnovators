import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTemplateDto } from '../questionnaire-template/dto/create-template.dto';
import { ParseMongoIdPipe } from '../questionnaire-template/pipes/parse-mongo-id.pipe';
import { QuestionnaireTemplateService } from '../questionnaire-template/questionnaire-template.service';

/** Routes under `/api/questionnaires` for admin-style listing and creation. */
@Controller('api/questionnaires')
export class QuestionnairesApiController {
  constructor(
    private readonly questionnaireTemplateService: QuestionnaireTemplateService,
  ) {}

  @Get('templates')
  listTemplates() {
    return this.questionnaireTemplateService.findAll();
  }

  @Get('templates/:id')
  getTemplate(@Param('id', ParseMongoIdPipe) id: string) {
    return this.questionnaireTemplateService.findOne(id);
  }

  @Post('templates')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.questionnaireTemplateService.create(dto);
  }

  @Patch('templates/:id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  updateTemplate(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.questionnaireTemplateService.update(id, dto);
  }
}
