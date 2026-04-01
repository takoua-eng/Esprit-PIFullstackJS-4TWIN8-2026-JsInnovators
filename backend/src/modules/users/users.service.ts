import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { Role, RoleDocument } from '../roles/role.schema';
import { CounterDocument } from './counter.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

const USER_ID_COUNTER = 'userId';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel('Counter') private counterModel: Model<CounterDocument>,
  ) { }

  /** Get next sequential user ID (mediflow1, mediflow2, ...). Never reused after delete. */
  private async getNextUserId(): Promise<string> {
    const doc = await this.counterModel
      .findOneAndUpdate(
        { _id: USER_ID_COUNTER },
        { $inc: { value: 1 } },
        { new: true, upsert: true },
      )
      .exec();
    return `mediflow${doc.value}`;
  }

  // Création d'un utilisateur
  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { role, password, ...rest } = createUserDto;

    // 🔍 chercher le rôle par NOM (role obligatoire)
    const roleDoc = await this.roleModel.findOne({ name: role }).exec();

    if (!roleDoc) {
      throw new NotFoundException(`Role ${role} not found`);
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      ...rest,
      role: roleDoc._id, // ✅ stocker ObjectId
      password: hashedPassword,
    });

    return user.save();
  }
  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().populate('role').exec();
  }

  // Récupérer un utilisateur par userId (e.g. mediflow1) ou par ancien _id ObjectId
  async getUser(id: string): Promise<UserDocument> {
    let user = await this.userModel
      .findOne({ userId: id })
      .populate('role')
      .exec();
    if (!user && Types.ObjectId.isValid(id)) {
      user = await this.userModel
        .findById(id)
        .populate('role')
        .exec();
    }
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // Modifier un utilisateur
  async updateUser(id: string, updateDto: any): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new Error('User not found');

    Object.assign(user, updateDto);
    await user.save();

    return user; // ✅ Important
  }
  // Supprimer un utilisateur (counter is not decremented; ID never reused)
  async deleteUser(id: string): Promise<any> {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('Patient non trouvé');
    }

    return { message: 'Patient supprimé avec succès' };
  }


  async updateUserAvatar(id: string, file: Express.Multer.File): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new Error('User not found');

    user.photo = file.filename;
    await user.save();

    return user;
  }

  //ajout patient avec photo
  async createPatient(data: any, file: Express.Multer.File) {

    const roleDoc = await this.roleModel.findOne({
      name: { $regex: '^PATIENT$', $options: 'i' }
    });

    if (!roleDoc) {
      throw new Error('Role PATIENT not found');
    }

    const patient = new this.userModel({
      ...data,
      role: roleDoc._id, // ✅ IMPORTANT
      photo: file ? file.filename : null
    });

    return patient.save();
  }

  async getPatients() {
    const roleDoc = await this.roleModel.findOne({
      name: { $regex: '^PATIENT$', $options: 'i' }
    });

    if (!roleDoc) {
      throw new Error('Role PATIENT not found');
    }

    return this.userModel
      .find({ role: roleDoc._id })
      .populate('role');
  }

  //create doctors: 
  // Création d'un médecin avec photo (similaire à createPatient)
  async createDoctor(data: any, file: Express.Multer.File) {
    const roleDoc = await this.roleModel.findOne({
      name: { $regex: '^doctor$', $options: 'i' } // insensible à la casse
    });

    if (!roleDoc) {
      throw new Error('Role doctor not found');
    }

    const doctor = new this.userModel({
      ...data,
      role: roleDoc._id,
      photo: file ? file.filename : null
    });

    return doctor.save();
  }

  async getDoctors() {
  // 🔍 Chercher le rôle "doctor" insensible à la casse
  const roleDoc = await this.roleModel.findOne({
    name: { $regex: '^doctor$', $options: 'i' }
  });

  if (!roleDoc) {
    throw new Error('Role DOCTOR not found');
  }

  // 🔹 Récupérer tous les users avec ce rôle
  return this.userModel
    .find({ role: roleDoc._id })
    .populate('role')       // Populer les informations du rôle
    .populate('serviceId'); // Populer le service si tu veux afficher son nom
}

async createCoordinator(data: any, file: Express.Multer.File) {

  const roleDoc = await this.roleModel.findOne({
    name: { $regex: '^coordinator$', $options: 'i' }
  });

  if (!roleDoc) {
    throw new Error('Role COORDINATOR not found');
  }

  const coordinator = new this.userModel({
    ...data,
    role: roleDoc._id, // ✅ IMPORTANT (ObjectId du role)
    photo: file ? file.filename : null
  });

  return coordinator.save();
}

async getCoordinators() {

  const roleDoc = await this.roleModel.findOne({
    name: { $regex: '^coordinator$', $options: 'i' }
  });

  if (!roleDoc) {
    throw new Error('Role COORDINATOR not found');
  }

  return this.userModel
    .find({ role: roleDoc._id })
    .populate('role')
    .populate('serviceId'); // optionnel si tu ajoutes service plus tard
}

}
