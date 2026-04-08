import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SymptomsService } from './symptoms.service';

@UseGuards(JwtAuthGuard)
@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  /** List for staff (optional `patientId` filter); patient app uses routes below. */
  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.symptomsService.findAllForStaff(patientId);
  }

  @Post()
  createSymptoms(@Body() data: any) {
    return this.symptomsService.createSymptoms(data);
  }

  @Get('patient/:patientId/today')
  hasEnteredToday(@Param('patientId') patientId: string) {
    return this.symptomsService.hasEnteredToday(patientId);
  }

  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.symptomsService.getByPatient(patientId);
  }

  @Patch(':id/verify')
  verify(
    @Param('id') id: string,
    @Body() body: { nurseUserId: string },
  ) {
    return this.symptomsService.verify(id, body.nurseUserId);
  }
}
