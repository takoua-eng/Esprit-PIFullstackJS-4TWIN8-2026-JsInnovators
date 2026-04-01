import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';

// DTOs
import { CreatePatientDto } from './dto/CreatePatientDto ';
import { CreateDoctorDto } from './dto/CreateDoctorDto ';
import { CreateAdminDto } from './dto/CreateAdminDto ';
import { CreateNurseDto } from './dto/CreateNurseDto ';
import { CreateCoordinatorDto } from './dto/CreateCoordinatorDto ';
import { CreateAuditorDto } from './dto/CreateAuditorDto ';

// Multer Storage Configuration
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads';
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // 🔴 PATIENT (with photo)
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('patients')
  createPatient(
    @Body() dto: CreatePatientDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createPatient(dto, file);
  }

  // =========================
  // 🔵 DOCTOR
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('doctors')
  createDoctor(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createDoctor(dto, file);
  }

  // =========================
  // 🟢 NURSE
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('nurses')
  createNurse(
    @Body() dto: CreateNurseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createNurse(dto, file);
  }

  // =========================
  // 🟣 COORDINATOR
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('coordinators')
  createCoordinator(
    @Body() dto: CreateCoordinatorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createCoordinator(dto, file);
  }

  // =========================
  // ⚫ ADMIN
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('admins')
  createAdmin(
    @Body() dto: CreateAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createAdmin(dto, file);
  }

  // =========================
  // ⚪ AUDITOR
  // =========================
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('auditors')
  createAuditor(
    @Body() dto: CreateAuditorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createAuditor(dto, file);
  }

  // =========================
  // GETS
  // =========================
  @Get('patients')
  getPatients() {
    return this.usersService.getPatients();
  }

  @Get('doctors')
  getDoctors() {
    return this.usersService.getDoctors();
  }

  @Get('nurses')
  getNurses() {
    return this.usersService.getNurses();
  }

  @Get('coordinators')
  getCoordinators() {
    return this.usersService.getCoordinators();
  }

  @Get('admins')
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get('auditors')
  getAuditors() {
    return this.usersService.getAuditors();
  }

  @Get('role/:roleName')
  getByRole(@Param('roleName') roleName: string) {
    return this.usersService.getByRole(roleName);
  }

  @Get()
  findAll() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // RESTORE
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }
}
