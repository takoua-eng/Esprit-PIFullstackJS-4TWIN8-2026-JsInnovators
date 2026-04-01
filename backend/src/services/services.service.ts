import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './service.schema';

@Injectable()
export class ServicesService {

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>
  ) {}

  async create(data: any) {
    return this.serviceModel.create(data);
  }

  async findAll() {
    return this.serviceModel.find();
  }
}