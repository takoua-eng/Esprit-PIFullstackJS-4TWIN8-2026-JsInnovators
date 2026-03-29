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
import { User } from './user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  /** Patient accounts only (for nurse-assisted entry). Must stay before @Get(':id'). */
  @Get('patients')
  findPatients() {
    return this.usersService.findByRoleName('Patient');
  }

  @Get('nurses')
  findNurses() {
    return this.usersService.findByRoleName('Nurse');
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
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}