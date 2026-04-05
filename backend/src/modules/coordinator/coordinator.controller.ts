import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { NotificationService } from '../notifications/notification.service';

@Controller('coordinator')
export class CoordinatorController {
  constructor(
    private readonly coordinatorService: CoordinatorService,
    private readonly notificationService: NotificationService,
  ) {}

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

  @Get(':id/prediction')
  getPrediction(@Param('id') id: string) {
    return this.coordinatorService.getPrediction(id);
  }

  @Get(':id/patients/:patientId/message')
  getPersonalizedMessage(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
  ) {
    return this.coordinatorService.getPersonalizedMessage(id, patientId);
  }

  // ─── AI endpoints (proxy vers Claude) ────────────────────────

  @Post(':id/ai/chat')
  async aiChat(
    @Param('id') id: string,
    @Body() body: { prompt: string },
  ) {
    try {
      const response = await this.notificationService.askClaude(body.prompt, 300);
      return { response };
    } catch (err) {
      return { response: 'AI temporarily unavailable. Please try again.' };
    }
  }

  @Post(':id/ai/summary')
  async aiSummary(
    @Param('id') id: string,
    @Body() body: { prompt: string },
  ) {
    try {
      const response = await this.notificationService.askClaude(body.prompt, 500);
      return { response };
    } catch (err) {
      return { response: null };
    }
  }

  @Post(':id/ai/prediction')
  async aiPrediction(
    @Param('id') id: string,
    @Body() body: { prompt: string },
  ) {
    try {
      const response = await this.notificationService.askClaude(body.prompt, 800);
      return { response };
    } catch (err) {
      return { response: null };
    }
  }

  // ─── Reminders ────────────────────────────────────────────────

  @Get(':id/reminders')
  getReminders(@Param('id') id: string) {
    return this.coordinatorService.getReminders(id);
  }

  @Post(':id/reminders')
  createReminder(
    @Param('id') id: string,
    @Body() body: { patientId: string; type: string; message: string; scheduledAt?: string; status?: string },
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

  @Put('reminders/:reminderId')
  updateReminder(
    @Param('reminderId') reminderId: string,
    @Body() body: { type: string; message: string; scheduledAt?: string },
  ) {
    return this.coordinatorService.updateReminder(reminderId, body);
  }

  @Delete('reminders/:reminderId')
  deleteReminder(@Param('reminderId') reminderId: string) {
    return this.coordinatorService.deleteReminder(reminderId);
  }
}
