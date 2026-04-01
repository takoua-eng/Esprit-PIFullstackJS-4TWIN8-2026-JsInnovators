import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PatientNotesService } from './patient-notes.service';

@Controller('patient-notes')
export class PatientNotesController {
  constructor(private readonly patientNotesService: PatientNotesService) {}

  @Post()
  create(@Body() body: { fromUserId: string; toUserId: string; message: string }) {
    return this.patientNotesService.create(body.fromUserId, body.toUserId, body.message);
  }

  @Get('from/:userId')
  getBySender(@Param('userId') userId: string) {
    return this.patientNotesService.getBySender(userId);
  }
}