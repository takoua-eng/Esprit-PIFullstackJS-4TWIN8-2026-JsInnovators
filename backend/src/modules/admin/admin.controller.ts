import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TrafficStatsQueryDto } from './dto/traffic-stats-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('traffic-stats')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  getTrafficStats(@Query() query: TrafficStatsQueryDto) {
    return this.adminService.getTrafficStats(query.mode);
  }
}
