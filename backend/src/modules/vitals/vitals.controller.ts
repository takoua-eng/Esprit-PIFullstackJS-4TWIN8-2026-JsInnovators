import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VitalsService } from './vitals.service';

@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.vitalsService.findAll(patientId);
  }

  @Post()
  create(
    @Body()
    body: {
      patientId: string;
      recordedBy: string;
      entrySource?: 'patient' | 'nurse_assisted';
      temperature?: number;
      bloodPressure?: string;
      weight?: number;
      heartRate?: number;
      notes?: string;
      recordedAt?: string;
    },
  ) {
    return this.vitalsService.create({
      ...body,
      entrySource: body.entrySource ?? 'nurse_assisted',
    });
  }

  @Patch(':id/verify')
  verify(
    @Param('id') id: string,
    @Body() body: { nurseUserId: string },
  ) {
    return this.vitalsService.verify(id, body.nurseUserId);
  }
}
