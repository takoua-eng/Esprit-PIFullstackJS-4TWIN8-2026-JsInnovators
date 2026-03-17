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
  ) {}

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
    const { roleId, password, ...rest } = createUserDto;

    const role = await this.roleModel.findById(roleId).exec();
    if (!role) throw new NotFoundException('Role not found');

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await this.getNextUserId();

    const user = new this.userModel({
      userId,
      ...rest,
      role: role._id,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll() {
  return this.userModel.find().exec();
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
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.getUser(id);

    if (updateUserDto.roleId) {
      const role = await this.roleModel.findById(updateUserDto.roleId).exec();
      if (!role) throw new NotFoundException('Role not found');
      user.role = role._id; // stocker ObjectId du rôle
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Mettre à jour les autres champs
    Object.assign(user, updateUserDto);

    return user.save();
  }

  // Supprimer un utilisateur (counter is not decremented; ID never reused)
  async deleteUser(id: string): Promise<void> {
    let result = await this.userModel.findOneAndDelete({ userId: id }).exec();
    if (!result && Types.ObjectId.isValid(id)) {
      result = await this.userModel.findByIdAndDelete(id).exec();
    }
    if (!result) throw new NotFoundException(`User with id ${id} not found`);
  }

  async updateUserAvatar(
    id: string,
    file: { path: string; filename: string },
  ): Promise<UserDocument> {
    const user = await this.getUser(id);
    user.photo = file.filename;
    return user.save();
  }
}
