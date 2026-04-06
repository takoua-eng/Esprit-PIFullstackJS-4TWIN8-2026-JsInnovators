import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SignInDto } from '../auth/dto/SignIn.dto';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  // 🔹 Mot de passe oublié
  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new BadRequestException('Email non trouvé');

    const token = randomBytes(32).toString('hex');
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

  // 🔹 Sign In ✅ MODIFIÉ AVEC PERMISSIONS
  async signIn(
    signInDto: SignInDto,
    req: Request,
  ): Promise<{
    accessToken: string;
    role: string;
    permissions: string[]; // ✅ AJOUT: retourne les permissions
  }> {
    const rawEmail = signInDto?.email?.trim();
    const password = signInDto?.password ?? '';

    if (!rawEmail || !password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const escaped = rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // ✅ MODIFICATION 1: populate avec 'name' ET 'permissions'
    const user = await this.userModel
      .findOne({
        email: new RegExp(`^${escaped}$`, 'i'),
      })
      .populate<{ name: string; permissions: string[] }>(
        'role',
        'name permissions',
      )
      .exec();

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.isArchived) {
      throw new UnauthorizedException(
        'Ce compte est archivé. Un administrateur doit le restaurer (isArchived: false) pour permettre la connexion.',
      );
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // ✅ MODIFICATION 2: extraire roleName et permissions
    const roleName =
      user.role && typeof user.role === 'object' && 'name' in user.role
        ? String((user.role as { name: string }).name)
        : '';

    const permissions =
      user.role && typeof user.role === 'object' && 'permissions' in user.role
        ? Array.isArray((user.role as { permissions: string[] }).permissions)
          ? (user.role as { permissions: string[] }).permissions
          : []
        : [];

    // ✅ MODIFICATION 3: ajouter permissions dans le payload JWT
    const payload = {
      sub: user._id,
      email: user.email,
      role: roleName,
      permissions: permissions, // ✅ permissions dans le token
    };

    const accessToken = this.jwtService.sign(payload);
    const ip = req?.ip ?? 'unknown';
    await this.auditService.create({
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user._id.toString(),
      before: null,
      after: null,
      ipAddress: ip,
    });

    // ✅ MODIFICATION 4: retourner permissions dans la réponse
    return {
      accessToken,
      role: roleName,
      permissions, // ✅ frontend utilise ça pour cacher/afficher les boutons
    };
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

    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

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
