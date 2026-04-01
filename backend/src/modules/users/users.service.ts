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
async deleteUser(id: string): Promise < void> {
      let result = await this.userModel.findOneAndDelete({ _id: id }).exec();

      if(!result && Types.ObjectId.isValid(id)) {
      result = await this.userModel.findByIdAndDelete(id).exec();
    }

    if (!result) {
      throw new Error('User not found');
    }
  }


  async updateUserAvatar(id: string, file: Express.Multer.File): Promise<UserDocument> {
  const user = await this.userModel.findById(id).exec();
  if (!user) throw new Error('User not found');

  user.photo = file.filename;
  await user.save();

  return user;
}

  async getUsersByRole(roleName: string): Promise<UserDocument[]> {
    const roleDoc = await this.roleModel.findOne({ name: roleName }).exec();
    if (!roleDoc) return [];
    return this.userModel
      .find({ role: roleDoc._id })
      .select('firstName lastName email specialization department photo')
      .exec();
  }
}
