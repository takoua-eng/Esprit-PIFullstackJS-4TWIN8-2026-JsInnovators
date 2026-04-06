import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  ForbiddenException,
  NotFoundException,
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
import { NurseDossierDto } from './dto/nurse-dossier.dto';

// Guards & Decorators
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Multer Config
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
};

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // 🔴 CREATE (Patients, Doctors, etc.)
  // =========================

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('patients')
  @Permissions('patients:create')
  createPatient(
    @Body() dto: CreatePatientDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('📥 CREATE PATIENT - body:', JSON.stringify(dto, null, 2));
    console.log('📎 file:', file?.filename ?? 'none');
    return this.usersService.createPatient(dto, file);
  }

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('doctors')
  @Permissions('doctors:create')
  createDoctor(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createDoctor(dto, file);
  }

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('nurses')
  @Permissions('nurses:create')
  createNurse(
    @Body() dto: CreateNurseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createNurse(dto, file);
  }

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('coordinators')
  @Permissions('coordinators:create')
  createCoordinator(
    @Body() dto: CreateCoordinatorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createCoordinator(dto, file);
  }

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('admins')
  @Permissions('users:create')
  createAdmin(
    @Body() dto: CreateAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createAdmin(dto, file);
  }

  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Post('auditors')
  @Permissions('auditors:create')
  createAuditor(
    @Body() dto: CreateAuditorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.createAuditor(dto, file);
  }

  // =========================
  // ✅ GET - Avec conditions PATIENT
  // =========================

  @Get('patients')
  @Permissions('patients:read') // ✅ Patient ne peut PAS voir la liste
  getPatients() {
    return this.usersService.getPatients();
  }

  @Get('doctors')
  @Permissions('doctors:read')
  getDoctors() {
    return this.usersService.getDoctors();
  }

  @Get('nurses')
  @Permissions('nurses:read')
  getNurses() {
    return this.usersService.getNurses();
  }

  @Get('coordinators')
  @Permissions('coordinators:read')
  getCoordinators() {
    return this.usersService.getCoordinators();
  }

  @Get('admins')
  @Permissions('users:read') // ✅ Réservé aux admins
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get('auditors')
  @Permissions('audit:read')
  getAuditors() {
    return this.usersService.getAuditors();
  }

  @Get('role/:roleName')
  @Permissions('users:read')
  getByRole(@Param('roleName') roleName: string) {
    return this.usersService.getByRole(roleName);
  }

  @Get()
  @Permissions('users:read')
  findAll() {
    return this.usersService.getAllUsers();
  }

  @Get('physicians')
  @Permissions('doctors:read')
  findPhysicians() {
    return this.usersService.findByRoleName('Physician');
  }

  // ✅ GET UN USER : Condition spéciale pour patient
  @Get(':id')
  @Permissions('users:read', 'profile:read') // L'un OU l'autre suffit
  findOne(@Param('id') id: string, @Request() req) {
    const user = req.user; // ← vient du JWT

    // 🎯 CONDITION PATIENT : Peut voir SON propre profil uniquement
    if (user.role === 'patient' && user.permissions.includes('profile:read')) {
      if (user._id !== id) {
        throw new ForbiddenException(
          'Accès refusé: vous ne pouvez voir que votre propre profil',
        );
      }
    }

    // Sinon, il faut avoir "users:read" (admin, doctor, etc.)
    if (!user.permissions.includes('users:read') && user.role === 'patient') {
      throw new ForbiddenException('Accès refusé');
    }

    return this.usersService.getUser(id);
  }

  // ✅ GET NURSE DOSSIER : Condition spéciale
  @Get(':patientId/nurse-dossier')
  @Permissions('patients:read', 'profile:read')
  getNurseDossier(@Param('patientId') patientId: string, @Request() req) {
    const user = req.user;

    // Patient ne peut voir que SON dossier
    if (user.role === 'patient' && user.permissions.includes('profile:read')) {
      if (user._id !== patientId) {
        throw new ForbiddenException('Accès refusé: dossier non autorisé');
      }
    }

    return this.usersService.getNurseDossier(patientId);
  }

  // =========================
  // ✅ UPDATE - Avec conditions PATIENT
  // =========================

  @Put(':patientId/nurse-dossier')
  @Permissions('patients:update', 'nurses:manage')
  updateNurseDossier(
    @Param('patientId') patientId: string,
    @Body() dto: NurseDossierDto,
  ) {
    return this.usersService.updateNurseDossier(patientId, dto);
  }

  // ✅ UPDATE USER
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Put(':id')
  @Permissions('users:update', 'profile:update', 'patients:update', 'nurses:update', 'doctors:update', 'coordinators:update', 'auditors:update')
  update(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const user = req.user;
    const perms: string[] = user?.permissions ?? [];
    const isSuperAdmin = perms.includes('*');

    // Patient : peut modifier uniquement son propre profil, champs limités
    if (user.role === 'patient' && perms.includes('profile:update')) {
      if (user._id !== id) {
        throw new ForbiddenException('Accès refusé: vous ne pouvez modifier que votre propre profil');
      }
      const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'photo'];
      const filteredDto = Object.keys(dto)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => { obj[key] = dto[key]; return obj; }, {});
      return this.usersService.updateUserWithFile(id, filteredDto, file);
    }

    // SuperAdmin (*) ou admin avec users:update ou rôle-specific update → autorisé
    const canUpdate = isSuperAdmin
      || perms.includes('users:update')
      || perms.includes('patients:update')
      || perms.includes('nurses:update')
      || perms.includes('doctors:update')
      || perms.includes('coordinators:update')
      || perms.includes('auditors:update');

    if (!canUpdate) {
      throw new ForbiddenException('Permission insuffisante pour modifier cet utilisateur');
    }

    return this.usersService.updateUserWithFile(id, dto, file);
  }

  // =========================
  // ❌ DELETE - Jamais pour patient
  // =========================

  @Delete(':id')
  @Permissions('users:delete', 'patients:delete') // Patient n'a JAMAIS ces permissions
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // =========================
  // ✅ ACTIVATE/DEACTIVATE/RESTORE - Admin only
  // =========================

  @Put(':id/restore')
  @Permissions('users:manage')
  restore(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @Put(':id/activate')
  @Permissions('users:manage')
  activate(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Put(':id/deactivate')
  @Permissions('users:manage')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Get('stats/roles-count')
  //@Permissions('users:read')
  getUsersCountByRole() {
    return this.usersService.getUsersCountByRole();
  }
}
