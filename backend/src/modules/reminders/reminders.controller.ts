import { Controller, Get, Param, Patch } from '@nestjs/common';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll() {
    return this.remindersService.findAll();
  }

  @Get('stats/pending-count')
  async pendingCount() {
    const count = await this.remindersService.findPendingCount();
    return { count };
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.remindersService.complete(id);
  }
}
