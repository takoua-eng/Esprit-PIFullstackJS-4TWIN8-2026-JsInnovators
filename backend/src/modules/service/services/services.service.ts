import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from './service.schema';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
  ) {}

  // CREATE
  async create(dto: CreateServiceDto) {
    return this.serviceModel.create(dto);
  }

  // GET ALL
  async findAll() {
    return this.serviceModel.find().sort({ createdAt: -1 });
  }

  // GET ONE
  async findOne(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  // UPDATE
  async update(id: string, dto: UpdateServiceDto) {
    const updated = await this.serviceModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  // DELETE
  async remove(id: string) {
    const deleted = await this.serviceModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('Service not found');
    return { message: 'Service deleted successfully' };
  }
}
