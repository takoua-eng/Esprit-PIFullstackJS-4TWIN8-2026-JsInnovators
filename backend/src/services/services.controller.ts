import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {

  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }
}