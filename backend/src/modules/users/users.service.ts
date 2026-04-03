import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './users.schema';
import { Role, RoleDocument } from '../roles/role.schema';
import {
  PatientDiagnosis,
  PatientDiagnosisDocument,
} from './patient-diagnosis.schema';
import { NurseDossierDto } from './dto/nurse-dossier.dto';

import { CreatePatientDto } from './dto/CreatePatientDto ';
import { CreateDoctorDto } from './dto/CreateDoctorDto ';
import { CreateAdminDto } from './dto/CreateAdminDto ';
import { CreateNurseDto } from './dto/CreateNurseDto ';
import { CreateCoordinatorDto } from './dto/CreateCoordinatorDto ';
import { CreateAuditorDto } from './dto/CreateAuditorDto ';

/** Default Patient role `_id` when `PATIENT_ROLE_ID` is not set in `.env`. */
const DEFAULT_PATIENT_ROLE_OBJECT_ID = '69c44e6ce03c22d3ff723db5';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(PatientDiagnosis.name)
    private patientDiagnosisModel: Model<PatientDiagnosisDocument>,
    private readonly config: ConfigService,
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
    if (!user) {
      user = await this.userModel
        .findOne({ userId: id, isArchived: { $ne: true } })
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

  async getPatients() {
    return this.findPatients();
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

    user.isActive = false;
    return user.save();
  }

  /** Users with the given role name (e.g. Patient) — for nurse data entry / lists. */
  async findByRoleName(
    roleName: string,
  ): Promise<
    { _id: string; firstName: string; lastName: string; email: string }[]
  > {
    const trimmed = roleName.trim();
    if (!trimmed) return [];
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const roleRegex = new RegExp(`^${escaped}$`, 'i');

    const roleDocs = await this.roleModel
      .find({ name: { $regex: roleRegex } })
      .select('_id')
      .lean()
      .exec();
    const roleIds = roleDocs.map((r) => r._id);
    const query: Record<string, unknown> =
      roleIds.length > 0
        ? { role: { $in: roleIds } }
        : { role: { $regex: roleRegex } };
    const direct = await this.userModel
      .find(query)
      .select('firstName lastName email')
      .lean()
      .exec();

    if (direct.length) {
      return direct.map((u) => ({
        _id: (u._id as Types.ObjectId).toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      }));
    }
    const all = await this.userModel
      .find()
      .select('-password')
      .populate('role')
      .lean()
      .exec();
    return all
      .filter((u: any) => {
        const r = u?.role;
        if (!r) return false;
        if (typeof r === 'string') return roleRegex.test(r);
        return roleRegex.test(String(r?.name ?? ''));
      })
      .map((u: any) => ({
        _id: String(u._id),
        firstName: String(u.firstName ?? ''),
        lastName: String(u.lastName ?? ''),
        email: String(u.email ?? ''),
      }));
  }

  /**
   * Users whose `role` field equals this MongoDB ObjectId (exact match).
   */
  async findByRoleObjectId(
    roleObjectId: string,
  ): Promise<
    { _id: string; firstName: string; lastName: string; email: string }[]
  > {
    const trimmed = roleObjectId.trim();
    if (!trimmed || !Types.ObjectId.isValid(trimmed)) {
      return [];
    }
    const direct = await this.userModel
      .find({ role: new Types.ObjectId(trimmed) })
      .select('firstName lastName email')
      .lean()
      .exec();
    return direct.map((u) => ({
      _id: (u._id as Types.ObjectId).toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    }));
  }

  /**
   * Patient accounts for nurse/doctor lists (`GET /users/patients`).
   * Uses `PATIENT_ROLE_ID` from env, or {@link DEFAULT_PATIENT_ROLE_OBJECT_ID}.
   */
  async findPatients(): Promise<
    { _id: string; firstName: string; lastName: string; email: string }[]
  > {
    const id =
      this.config.get<string>('PATIENT_ROLE_ID')?.trim() ||
      DEFAULT_PATIENT_ROLE_OBJECT_ID;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'PATIENT_ROLE_ID in .env must be a valid 24-character MongoDB ObjectId',
      );
    }
    return this.findByRoleObjectId(id);
  }

  /** Match user by MongoDB `_id` (24-char hex) or by `userId` string (e.g. mediflow1). */
  private patientQuery(patientId: string): Record<string, unknown> {
    const t = patientId.trim();
    if (/^[a-fA-F0-9]{24}$/.test(t)) {
      return { _id: new Types.ObjectId(t) };
    }
    return { userId: t };
  }

  async getNurseDossier(
    patientId: string,
  ): Promise<Record<string, unknown> | null> {
    const doc = await this.userModel
      .findOne(this.patientQuery(patientId))
      .select('nurseDossier')
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException(`User ${patientId} not found`);
    }
    const pid = doc._id as Types.ObjectId;
    const embedded = (doc.nurseDossier ?? null) as Record<string, unknown> | null;

    let rows = await this.patientDiagnosisModel
      .find({ patientId: pid })
      .sort({ updatedAt: 1 })
      .lean()
      .exec();

    const embArr = embedded?.['diagnosisEntries'];
    if (Array.isArray(embArr) && embArr.length > 0 && rows.length === 0) {
      const sanitized = this.sanitizeDiagnosisEntries(embArr);
      await this.replacePatientDiagnosesInDb(pid, sanitized);
      await this.userModel
        .updateOne(
          { _id: pid },
          { $set: { 'nurseDossier.diagnosisEntries': [] } },
        )
        .exec();
      rows = await this.patientDiagnosisModel
        .find({ patientId: pid })
        .sort({ updatedAt: 1 })
        .lean()
        .exec();
    }

    const diagnosisEntries = rows.map((r) =>
      this.diagnosisDocToEntry(r as unknown as Record<string, unknown>),
    );

    const base =
      embedded && typeof embedded === 'object' && Object.keys(embedded).length > 0
        ? { ...embedded }
        : {};
    delete base['diagnosisEntries'];

    const merged: Record<string, unknown> = {
      ...base,
      diagnosisEntries,
    };

    if (!this.nurseDossierHasAnyContent(merged)) {
      return null;
    }
    return merged;
  }

  private nurseDossierHasAnyContent(d: Record<string, unknown>): boolean {
    const de = d['diagnosisEntries'];
    if (Array.isArray(de) && de.length > 0) {
      return true;
    }
    const keys = [
      'admissionDate',
      'dischargeDate',
      'dischargeUnit',
      'primaryDiagnosis',
      'hospitalizationReason',
      'secondaryDiagnoses',
      'proceduresPerformed',
      'dischargeSummaryNotes',
      'bloodType',
      'currentMedications',
      'allergies',
      'pastMedicalHistory',
      'substanceUse',
      'familyHistory',
      'updatedAt',
    ];
    return keys.some((k) => String(d[k] ?? '').trim().length > 0);
  }

  private diagnosisDocToEntry(
    doc: Record<string, unknown>,
  ): Record<string, unknown> {
    const createdAt = doc['createdAt'];
    const updatedAt = doc['updatedAt'];
    const c =
      createdAt instanceof Date
        ? createdAt.toISOString()
        : String(createdAt ?? '');
    const u =
      updatedAt instanceof Date
        ? updatedAt.toISOString()
        : String(updatedAt ?? '');
    return {
      id: String(doc['entryId'] ?? ''),
      admissionDate: String(doc['admissionDate'] ?? ''),
      dischargeDate: String(doc['dischargeDate'] ?? ''),
      dischargeUnit: String(doc['dischargeUnit'] ?? ''),
      primaryDiagnosis: String(doc['primaryDiagnosis'] ?? ''),
      hospitalizationReason: String(doc['hospitalizationReason'] ?? ''),
      secondaryDiagnoses: String(doc['secondaryDiagnoses'] ?? ''),
      proceduresPerformed: String(doc['proceduresPerformed'] ?? ''),
      dischargeSummaryNotes: String(doc['dischargeSummaryNotes'] ?? ''),
      createdAt: c,
      updatedAt: u,
    };
  }

  private async resolvePatientObjectId(patientId: string): Promise<Types.ObjectId> {
    const u = await this.userModel
      .findOne(this.patientQuery(patientId))
      .select('_id')
      .lean()
      .exec();
    if (!u) {
      throw new NotFoundException(`User ${patientId} not found`);
    }
    return u._id as Types.ObjectId;
  }

  private async replacePatientDiagnosesInDb(
    patientObjectId: Types.ObjectId,
    entries: Record<string, unknown>[],
  ): Promise<void> {
    await this.patientDiagnosisModel
      .deleteMany({ patientId: patientObjectId })
      .exec();
    if (entries.length === 0) {
      return;
    }
    await this.patientDiagnosisModel.insertMany(
      entries.map((e) => ({
        patientId: patientObjectId,
        entryId: String(e['id']),
        admissionDate: (e['admissionDate'] as string) || undefined,
        dischargeDate: (e['dischargeDate'] as string) || undefined,
        dischargeUnit: (e['dischargeUnit'] as string) || undefined,
        primaryDiagnosis: (e['primaryDiagnosis'] as string) || undefined,
        hospitalizationReason: (e['hospitalizationReason'] as string) || undefined,
        secondaryDiagnoses: (e['secondaryDiagnoses'] as string) || undefined,
        proceduresPerformed: (e['proceduresPerformed'] as string) || undefined,
        dischargeSummaryNotes: (e['dischargeSummaryNotes'] as string) || undefined,
      })),
    );
  }

  private legacyDtoToSyntheticEntries(dto: NurseDossierDto): unknown[] {
    const pick = (s?: string) => (typeof s === 'string' ? s.trim() : '');
    const has =
      pick(dto.admissionDate) ||
      pick(dto.dischargeDate) ||
      pick(dto.dischargeUnit) ||
      pick(dto.primaryDiagnosis) ||
      pick(dto.hospitalizationReason) ||
      pick(dto.secondaryDiagnoses) ||
      pick(dto.proceduresPerformed) ||
      pick(dto.dischargeSummaryNotes);
    if (!has) return [];
    return [
      {
        id: randomUUID(),
        admissionDate: pick(dto.admissionDate),
        dischargeDate: pick(dto.dischargeDate),
        dischargeUnit: pick(dto.dischargeUnit),
        primaryDiagnosis: pick(dto.primaryDiagnosis),
        hospitalizationReason: pick(dto.hospitalizationReason),
        secondaryDiagnoses: pick(dto.secondaryDiagnoses),
        proceduresPerformed: pick(dto.proceduresPerformed),
        dischargeSummaryNotes: pick(dto.dischargeSummaryNotes),
      },
    ];
  }

  private sanitizeDiagnosisEntries(raw: unknown): Record<string, unknown>[] {
    const pick = (s?: unknown) => (typeof s === 'string' ? s.trim() : '');
    if (!Array.isArray(raw)) return [];
    const now = new Date().toISOString();
    return raw
      .filter((x) => x && typeof x === 'object')
      .map((item) => {
        const o = item as Record<string, unknown>;
        const id = pick(o['id']) || randomUUID();
        const created = pick(o['createdAt']) || now;
        const updated = pick(o['updatedAt']) || now;
        return {
          id,
          admissionDate: pick(o['admissionDate']),
          dischargeDate: pick(o['dischargeDate']),
          dischargeUnit: pick(o['dischargeUnit']),
          primaryDiagnosis: pick(o['primaryDiagnosis']),
          hospitalizationReason: pick(o['hospitalizationReason']),
          secondaryDiagnoses: pick(o['secondaryDiagnoses']),
          proceduresPerformed: pick(o['proceduresPerformed']),
          dischargeSummaryNotes: pick(o['dischargeSummaryNotes']),
          createdAt: created,
          updatedAt: updated,
        };
      });
  }

  async updateNurseDossier(
    patientId: string,
    dto: NurseDossierDto,
  ): Promise<Record<string, unknown>> {
    const pick = (s?: string) => (typeof s === 'string' ? s.trim() : '');
    const updatedAt = new Date().toISOString();
    const diagnosisEntries = this.sanitizeDiagnosisEntries(
      dto.diagnosisEntries !== undefined
        ? dto.diagnosisEntries
        : this.legacyDtoToSyntheticEntries(dto),
    );

    const pid = await this.resolvePatientObjectId(patientId);
    await this.replacePatientDiagnosesInDb(pid, diagnosisEntries);

    const mergedStored: Record<string, unknown> = {
      version: 2,
      admissionDate: pick(dto.admissionDate),
      dischargeDate: pick(dto.dischargeDate),
      dischargeUnit: pick(dto.dischargeUnit),
      primaryDiagnosis: pick(dto.primaryDiagnosis),
      hospitalizationReason: pick(dto.hospitalizationReason),
      secondaryDiagnoses: pick(dto.secondaryDiagnoses),
      proceduresPerformed: pick(dto.proceduresPerformed),
      dischargeSummaryNotes: pick(dto.dischargeSummaryNotes),
      diagnosisEntries: [],
      bloodType: pick(dto.bloodType),
      currentMedications: pick(dto.currentMedications),
      allergies: pick(dto.allergies),
      pastMedicalHistory: pick(dto.pastMedicalHistory),
      substanceUse: pick(dto.substanceUse),
      familyHistory: pick(dto.familyHistory),
      updatedAt,
    };

    const res = await this.userModel
      .updateOne(this.patientQuery(patientId), {
        $set: { nurseDossier: mergedStored },
      })
      .exec();
    if (res.matchedCount === 0) {
      throw new NotFoundException(`User ${patientId} not found`);
    }
    this.logger.log(
      `nurseDossier write ok matched=${res.matchedCount} modified=${res.modifiedCount} patientId=${patientId.trim()} patientdiagnoses=${diagnosisEntries.length}`,
    );

    return {
      ...mergedStored,
      diagnosisEntries,
    };
}
}
