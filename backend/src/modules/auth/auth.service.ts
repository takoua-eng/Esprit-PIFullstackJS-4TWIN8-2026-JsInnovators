import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SignInDto } from '../auth/dto/SignIn.dto';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 🔹 Mot de passe oublié
  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new BadRequestException('Email non trouvé');

    const token = randomBytes(32).toString('hex');
    (user as any).resetToken = token;
    (user as any).resetTokenExpiry = Date.now() + 3600_000; // valable 1h
    await user.save();

    await this.sendResetEmail(email, token);
    return { message: 'Email de réinitialisation envoyé' };
  }

  // 🔹 Réinitialisation mot de passe
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({ resetToken: token }).exec();
    if (!user) throw new BadRequestException('Token invalide');
    if ((user as any).resetTokenExpiry < Date.now())
      throw new BadRequestException('Token expiré');

    user.password = await bcrypt.hash(newPassword, 10);
    (user as any).resetToken = null;
    (user as any).resetTokenExpiry = null;
    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // 🔹 Sign In
  async signIn(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; role: string }> {
    const email = signInDto?.email?.trim();
    const password = signInDto?.password ?? '';
    if (!email || !password) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await this.userModel
      .findOne({ email: new RegExp(`^${escaped}$`, 'i') })
      .populate<{ name: string }>('role')
      .exec();
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (user.isArchived) throw new UnauthorizedException('Compte archivé');
    if (user.isActive === false) throw new UnauthorizedException('Compte désactivé');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const roleName =
      user.role && typeof user.role === 'object' && 'name' in user.role
        ? String((user.role as { name: string }).name)
        : '';

    const payload = { sub: user._id, email: user.email, role: roleName };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, role: roleName };
  }

  // 🔹 Envoi email réinitialisation
  private async sendResetEmail(email: string, token: string) {
const transporter = nodemailer.createTransport({
  host: this.configService.get<string>('SMTP_HOST'),
  port: Number(this.configService.get<string>('SMTP_PORT')),
  secure: this.configService.get<string>('SMTP_SECURE') === 'true',
  auth: {
    user: this.configService.get<string>('SMTP_USER'),
    pass: this.configService.get<string>('SMTP_PASS'),
  },
});

  const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Mediflow" <${this.configService.get<string>('SMTP_USER')}>`,
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