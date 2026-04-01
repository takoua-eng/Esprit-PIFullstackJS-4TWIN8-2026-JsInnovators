import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './users.schema';
import { Role, RoleDocument } from '../roles/role.schema';

import { CreatePatientDto } from './dto/CreatePatientDto ';
import { CreateDoctorDto } from './dto/CreateDoctorDto ';
import { CreateAdminDto } from './dto/CreateAdminDto ';
import { CreateNurseDto } from './dto/CreateNurseDto ';
import { CreateCoordinatorDto } from './dto/CreateCoordinatorDto ';
import { CreateAuditorDto } from './dto/CreateAuditorDto ';
import { Service } from '../service/services/service.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  private async getRole(name: string) {
    const role = await this.roleModel.findOne({ name });
    if (!role) throw new NotFoundException(`Role ${name} not found`);
    return role;
  }

  private async createUser(
    dto: any,
    roleName: string,
    file?: Express.Multer.File,
  ) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const role = await this.getRole(roleName);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userModel.create({
      ...dto,
      password: hashedPassword,
      role: role._id,
      photo: file ? file.filename : null,
    });
  }

  createPatient(dto: CreatePatientDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'patient', file);
  }

  createDoctor(dto: CreateDoctorDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'doctor', file);
  }

  createNurse(dto: CreateNurseDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'nurse', file);
  }

  createCoordinator(dto: CreateCoordinatorDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'coordinator', file);
  }

  createAdmin(dto: CreateAdminDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'admin', file);
  }

  createAuditor(dto: CreateAuditorDto, file?: Express.Multer.File) {
    return this.createUser(dto, 'auditor', file);
  }

  async getAllUsers() {
    return this.userModel.find({ isArchived: { $ne: true } }).populate('role');
  }

  async getByRole(roleName: string) {
    const role = await this.getRole(roleName);

    return this.userModel
      .find({ role: role._id, isArchived: { $ne: true } })
      .populate('role');
  }

  async getUser(id: string) {
    let user: UserDocument | null = null;

    if (Types.ObjectId.isValid(id)) {
      user = await this.userModel
        .findOne({ _id: id, isArchived: { $ne: true } })
        .populate('role')
        .exec();
    }

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(id: string, dto: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return user.save();
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.isArchived = true;
    return user.save();
  }

  async restoreUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.isArchived = false;
    return user.save();
  }

  async updateUserAvatar(id: string, file: Express.Multer.File) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.photo = file ? file.filename : user.photo;
    return user.save();
  }

  // ===== ROLE HELPERS =====
  async getPatients() {
    const role = await this.getRole('patient');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async getDoctors() {
    const role = await this.getRole('doctor');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async getNurses() {
    const role = await this.getRole('nurse');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async getCoordinators() {
    const role = await this.getRole('coordinator');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async getAdmins() {
    const role = await this.getRole('admin');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async getAuditors() {
    const role = await this.getRole('auditor');
    return this.userModel.find({ role: role._id, isArchived: { $ne: true } });
  }

  async activateUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) throw new NotFoundException('User not found');

    user.isActive = true;
    return user.save();
  }
  async deactivateUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) throw new NotFoundException('User not found');

    user.isActive = false; // ✅ correct
    return user.save();
  }
}
