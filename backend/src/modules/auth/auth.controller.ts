import { Controller, Post, Body, Req, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from '../auth/dto/SignUp.dto';
import { SignInDto } from '../auth/dto/SignIn.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RoleDocument } from '../roles/role.schema';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  signIn(@Body() signInDto: SignInDto, @Req() req: express.Request) {
    return this.authService.signIn(signInDto, req);
  }

  /** Refresh permissions from DB — call on app init or after role change */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findByIdForAuth(req.user._id);
    if (!user) return req.user;
    const role = user.role as unknown as RoleDocument;
    return {
      _id: user._id.toString(),
      email: user.email,
      role: role?.name ?? '',
      permissions: role?.permissions ?? [],
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
