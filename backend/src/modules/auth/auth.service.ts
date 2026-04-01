import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.schema';
import { Role } from '../roles/role.schema';
import { UsersService } from '../users/users.service';
import { SignUpDto } from '../auth/dto/SignUp.dto';
import { SignInDto } from '../auth/dto/SignIn.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // 🔹 Mot de passe oublié
  async forgotPassword(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .populate<{ role_id: Role }>('role_id') // populate correct
      .exec();

    if (!user) throw new BadRequestException('Email non trouvé');

    const token = randomBytes(32).toString('hex');

    // ⚠️ stocker le token dans resetToken
    (user as any).resetToken = token;

    await user.save();

    await this.sendResetEmail(email, token);

    return { message: 'Email de réinitialisation envoyé' };
  }

  // 🔹 Réinitialisation mot de passe
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({ resetToken: token }).exec();
    if (!user) throw new BadRequestException('Token invalide');

    user.password = await bcrypt.hash(newPassword, 10);
    (user as any).resetToken = null;

    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // 🔹 Sign Up
  async signUp(signUpDto: SignUpDto): Promise<User> {
    return this.usersService.createUser(signUpDto as CreateUserDto);
  }

  // 🔹 Sign In
  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;

const user = await this.userModel
  .findOne({ email })
  .populate('role') // ✅ صحيح
  .exec();
  
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

const payload = {
  sub: user._id,
  email: user.email,
  role: (user.role as unknown as Role)?.name ?? 'Patient',
};

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  // 🔹 Envoi email réinitialisation
  private async sendResetEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const resetLink = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Mediflow" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Réinitialisation du mot de passe',
      html: `
        <h3>Réinitialisation du mot de passe</h3>
        <p>Cliquez sur le lien ci-dessous :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Ce lien expire bientôt.</p>
      `,
    });
  }
}