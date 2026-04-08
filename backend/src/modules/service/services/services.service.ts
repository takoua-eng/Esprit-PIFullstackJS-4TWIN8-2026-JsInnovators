import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './service.schema';
import { Model, Types } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
  ) {}

  private validateId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid service id: ${id}`);
    }
  }

  async create(dto: CreateServiceDto) {
    const exists = await this.serviceModel.findOne({
      $or: [{ name: dto.name }, { code: dto.code }],
    });
    if (exists)
      throw new BadRequestException('Service name or code already exists');
    return new this.serviceModel({
      ...dto,
      isActive: true,
      isArchived: false,
    }).save();
  }

  async findAll() {
    return this.serviceModel
      .find({ isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveOnly() {
    return this.serviceModel
      .find({ isArchived: { $ne: true }, isActive: { $ne: false } })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string) {
    this.validateId(id);
    const service = await this.serviceModel.findOne({
      _id: id,
      isArchived: false,
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    this.validateId(id);
    const updated = await this.serviceModel.findOneAndUpdate(
      { _id: id, isArchived: false },
      dto,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async archive(id: string) {
    this.validateId(id);
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    service.isArchived = true;
    service.isActive = false;
    return service.save();
  }

  async activate(id: string) {
    this.validateId(id);
    const service = await this.serviceModel.findById(id);
    if (!service || service.isArchived)
      throw new NotFoundException('Service not found or archived');
    service.isActive = true;
    return service.save();
  }

  async deactivate(id: string) {
    this.validateId(id);
    const service = await this.serviceModel.findById(id);
    if (!service || service.isArchived)
      throw new NotFoundException('Service not found or archived');
    service.isActive = false;
    return service.save();
  }
}
