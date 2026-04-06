import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Active MongoDB database name (same connection as `alerts`, `users`, etc.). */
  @Get('database')
  getDatabase() {
    return this.appService.getDatabaseInfo();
  }
}
