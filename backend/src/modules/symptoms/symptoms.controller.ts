import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';

@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.symptomsService.findAll(patientId);
  }

  @Post()
  create(
    @Body()
    body: {
      patientId: string;
      reportedBy: string;
      entrySource?: 'patient' | 'nurse_assisted';
      symptoms?: string[];
      painLevel?: number;
      description?: string;
      reportedAt?: string;
    },
  ) {
    return this.symptomsService.create({
      ...body,
      entrySource: body.entrySource ?? 'nurse_assisted',
    });
  }

  @Patch(':id/verify')
  verify(
    @Param('id') id: string,
    @Body() body: { nurseUserId: string },
  ) {
    return this.symptomsService.verify(id, body.nurseUserId);
  }
}
