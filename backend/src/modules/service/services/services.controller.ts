import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  // GET ALL (only not archived)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  // ARCHIVE (soft delete)
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.service.archive(id);
  }

  // ACTIVATE
  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  // DEACTIVATE
  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
