import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// DTOs
import { CreatePatientDto } from './dto/CreatePatientDto ';
import { CreateDoctorDto } from './dto/CreateDoctorDto ';
import { CreateAdminDto } from './dto/CreateAdminDto ';
import { CreateNurseDto } from './dto/CreateNurseDto ';
import { CreateCoordinatorDto } from './dto/CreateCoordinatorDto ';
import { CreateAuditorDto } from './dto/CreateAuditorDto ';
import { NurseDossierDto } from './dto/nurse-dossier.dto';

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
  constructor(private readonly usersService: UsersService) { }

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

  @Get('physicians')
  findPhysicians() {
    return this.usersService.findByRoleName('Physician');
  }

  @Get(':patientId/nurse-dossier')
  getNurseDossier(@Param('patientId') patientId: string) {
    return this.usersService.getNurseDossier(patientId);
  }

  @Put(':patientId/nurse-dossier')
  updateNurseDossier(
    @Param('patientId') patientId: string,
    @Body() dto: NurseDossierDto,
  ) {
    return this.usersService.updateNurseDossier(patientId, dto);
  }


  // users.controller.ts
  @Get('doctors/:id')
  getDoctorById(@Param('id') id: string) {
    return this.usersService.getDoctor(id); // méthode spécifique à créer dans UsersService
  }

  @Get('nurses/:id')
  getNurseById(@Param('id') id: string) {
    return this.usersService.getNurse(id);
  }

  // Ajouter après @Get('doctors/:id')

  @Get('patients/:id')
  getPatientById(@Param('id') id: string) {
    return this.usersService.getPatient(id);
  }

  @Put('patients/:id/archive')
  archivePatient(@Param('id') id: string) {
    return this.usersService.archivePatient(id);
  }

  @Put('patients/:id/activate')
  activatePatient(@Param('id') id: string) {
    return this.usersService.activatePatient(id);
  }

  @Put('patients/:id/deactivate')
  deactivatePatient(@Param('id') id: string) {
    return this.usersService.deactivatePatient(id);
  }

  // ✅ OK ordre correct

  @Get('coordinators')
  getCoordinators() {
    return this.usersService.getCoordinators();
  }

  @Get('coordinators/:id')
  getCoordinatorById(@Param('id') id: string) {
    return this.usersService.getCoordinator(id);
  }

  @Get('auditors/:id')
getAuditorById(@Param('id') id: string) {
  return this.usersService.getAuditor(id);
}





// --- Archive auditor ---
@Put('auditors/:id/archive')
archiveAuditor(@Param('id') id: string) {
  return this.usersService.archiveAuditor(id);
}

// --- Activate auditor ---
@Put('auditors/:id/activate')
activateAuditor(@Param('id') id: string) {
  return this.usersService.activateAuditor(id);
}

// --- Deactivate auditor ---
@Put('auditors/:id/deactivate')
deactivateAuditor(@Param('id') id: string) {
  return this.usersService.deactivateAuditor(id);
}

// --- Update auditor (with optional file upload) ---
@UseInterceptors(FileInterceptor('file', multerConfig))
@Put('auditors/:id')
updateAuditor(
  @Param('id') id: string,
  @Body() dto: any,
  @UploadedFile() file?: Express.Multer.File
) {
  return this.usersService.updateAuditor(id, dto, file);
}

  //get profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    return this.usersService.getUser(userId);
  }
  // ⚠️ TOUJOURS À LA FIN
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }


  //edit patient with optional photo
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Put('patients/:id')
  updatePatient(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.updatePatient(id, dto, file);
  }


  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Put('doctors/:id')
  updateDoctor(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.updateDoctor(id, dto, file);
  }

  // Update Coordinator with optional photo
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Put('coordinators/:id')
  updateCoordinator(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.updateCoordinator(id, dto, file);
  }

  // Update Nurse with optional photo
  // Update Nurse with optional photo
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Put('nurses/:id')
  updateNurse(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.updateNurse(id, dto, file);
  }

  // Archiving endpoints
  @Put('coordinators/:id/archive')
  archiveCoordinator(@Param('id') id: string) {
    return this.usersService.archiveCoordinator(id);
  }
  // Activate / Deactivate
  @Put('coordinators/:id/activate')
  activateCoordinator(@Param('id') id: string) {
    return this.usersService.activateCoordinator(id);
  }

  // Archiver nurse
  @Put('nurses/:id/archive')
  archiveNurse(@Param('id') id: string) {
    return this.usersService.archiveNurse(id);
  }

  // Activer nurse
  @Put('nurses/:id/activate')
  activateNurse(@Param('id') id: string) {
    return this.usersService.activateNurse(id);
  }

  // Désactiver nurse
  @Put('nurses/:id/deactivate')
  deactivateNurse(@Param('id') id: string) {
    return this.usersService.deactivateNurse(id);
  }

  @Put('coordinators/:id/deactivate')
  deactivateCoordinator(@Param('id') id: string) {
    return this.usersService.deactivateCoordinator(id);
  }


  @Put('doctors/:id/archive')
  archiveDoctor(@Param('id') id: string) {
    return this.usersService.archiveDoctor(id);
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

  //verification de l'email
  @Get('check-email/:email')
  checkEmail(@Param('email') email: string) {
    return this.usersService.emailExists(email); // à créer dans UsersService
  }


  // Check email for Coordinator
  @Get('coordinators/check-email/:email')
  checkCoordinatorEmail(@Param('email') email: string) {
    return this.usersService.coordinatorEmailExists(email);
  }



}
