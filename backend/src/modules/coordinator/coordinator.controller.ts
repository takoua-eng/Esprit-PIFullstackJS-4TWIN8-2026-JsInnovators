import { Controller, Get, Param } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';

@Controller('coordinator')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get(':id/dashboard')
  getDashboard(@Param('id') id: string) {
    return this.coordinatorService.getDashboard(id);
  }

  @Get(':id/patients')
  getAssignedPatients(@Param('id') id: string) {
    return this.coordinatorService.getAssignedPatients(id);
  }
}