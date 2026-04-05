import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { QuestionnaireInstanceService } from './questionnaire-instance.service';

@Controller('instances')
export class QuestionnaireInstanceController {
  constructor(
    private readonly questionnaireInstanceService: QuestionnaireInstanceService,
  ) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Body() dto: CreateInstanceDto) {
    return this.questionnaireInstanceService.create(dto);
  }
}
