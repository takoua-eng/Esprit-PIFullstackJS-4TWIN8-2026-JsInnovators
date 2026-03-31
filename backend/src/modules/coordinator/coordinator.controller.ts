import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
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

  @Get(':id/compliance/today')
  getComplianceToday(@Param('id') id: string) {
    return this.coordinatorService.getComplianceToday(id);
  }

  @Get(':id/reminders')
  getReminders(@Param('id') id: string) {
    return this.coordinatorService.getReminders(id);
  }

  @Post(':id/reminders')
  createReminder(
    @Param('id') id: string,
    @Body() body: { patientId: string; type: string; message: string; scheduledAt?: string },
  ) {
    return this.coordinatorService.createReminder(id, body);
  }

  @Put('reminders/:reminderId/send')
  sendReminder(@Param('reminderId') reminderId: string) {
    return this.coordinatorService.sendReminder(reminderId);
  }

  @Put('reminders/:reminderId/cancel')
  cancelReminder(@Param('reminderId') reminderId: string) {
    return this.coordinatorService.cancelReminder(reminderId);
  }

  @Delete('reminders/:reminderId')
  deleteReminder(@Param('reminderId') reminderId: string) {
    return this.coordinatorService.deleteReminder(reminderId);
  }
}