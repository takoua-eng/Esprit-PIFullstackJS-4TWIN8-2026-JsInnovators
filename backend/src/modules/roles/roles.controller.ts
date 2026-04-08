import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from '../auth/dto/create-role.dto';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';
import { Role } from './role.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  findAll(): Promise<Role[]> {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  getPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.getRole(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.deleteRole(id);
  }
  // roles.controller.ts

  @Put(':id/archive')
  archive(@Param('id') id: string): Promise<Role> {
    return this.rolesService.archiveRole(id);
  }
}
