import {
  BadRequestException,
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
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import { diskStorage } from 'multer';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }


  

  // 🔹 Upload avatar
  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/avatar')
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateUserAvatar(id, file);
  }

  // 🔹 Create user
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // 🔹 Get all users
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
  @Get('patients')
  getPatients() {
    return this.usersService.getPatients();
  }
  @Get('doctors')
  getDoctors() {
    return this.usersService.getDoctors();
  }
  // GET coordinators
  @Get('coordinators')
  getCoordinators() {
    return this.usersService.getCoordinators();
  }
  // 🔹 Get one user by id
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.getUser(id);
  }

  // 🔹 Update user
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  // 🔹 Delete user
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('patient')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
      }
    })
  }))
  createPatient(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {

    return this.usersService.createPatient(body, file);

  }


  // src/users/users.controller.ts
  // POST /users/doctor
  @Post('doctor')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
      }
    })
  }))
  createDoctor(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.usersService.createDoctor(body, file);
  }


  @Post('coordinator')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
      }
    })
  }))
  createCoordinator(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.usersService.createCoordinator(body, file);
  }



}