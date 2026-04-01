import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from '../auth/dto/SignUp.dto';
import { SignInDto } from '../auth/dto/SignIn.dto';
import { User } from '../users/users.schema';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
  signIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ accessToken: string; role: string }> {
    return this.authService.signIn(signInDto);
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