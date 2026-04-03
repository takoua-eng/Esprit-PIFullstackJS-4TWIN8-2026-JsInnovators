import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VideoCallsService, VideoCallInviteDto } from './video-calls.service';

class CreateInviteDto {
  patientId: string;
  physicianUserId: string;
}

class DismissInviteDto {
  patientId: string;
}

@Controller('video-calls')
export class VideoCallsController {
  constructor(private readonly videoCallsService: VideoCallsService) {}

  /** Doctor UI: notify the patient that a video room is ready (patient sees a popup while logged in). */
  @Post('invite')
  createInvite(@Body() body: CreateInviteDto) {
    if (!body?.patientId?.trim() || !body?.physicianUserId?.trim()) {
      throw new BadRequestException('patientId and physicianUserId are required');
    }
    return this.videoCallsService.createInvite({
      patientId: body.patientId.trim(),
      physicianUserId: body.physicianUserId.trim(),
    });
  }

  /**
   * Patient UI: poll for a pending invite.
   * Always returns JSON `{ invite: ... }` — Nest/Express often sends an empty body for bare `null`,
   * which breaks the Angular client (content-length: 0).
   */
  @Get('pending')
  async getPending(
    @Query('patientId') patientId?: string,
  ): Promise<{ invite: VideoCallInviteDto | null }> {
    if (!patientId?.trim()) {
      return { invite: null };
    }
    const invite = await this.videoCallsService.findPendingForPatient(
      patientId.trim(),
    );
    return { invite };
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id') id: string, @Body() body: DismissInviteDto) {
    return this.videoCallsService.dismiss(id, body?.patientId);
  }
}
