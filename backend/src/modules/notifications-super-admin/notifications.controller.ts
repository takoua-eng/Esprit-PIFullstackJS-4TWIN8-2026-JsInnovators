import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  /** Get all notifications for the logged-in user */
  @Get()
  getMyNotifications(@Request() req: any) {
    return this.svc.findForUser(req.user._id);
  }

  /** Count unread */
  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.svc.countUnread(req.user._id).then(count => ({ count }));
  }

  /** Mark one as read */
  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  /** Mark all as read */
  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.svc.markAllRead(req.user._id);
  }
}
