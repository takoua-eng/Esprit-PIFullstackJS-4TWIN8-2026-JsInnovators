import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDoctorDto {
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  firstName: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  lastName: string;

  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsString({ message: 'La spécialisation doit être une chaîne de caractères' })
  @MinLength(2, { message: 'La spécialisation doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'La spécialisation ne peut pas dépasser 100 caractères' })
  specialization: string;

  @IsString({ message: 'Le numéro de licence doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le numéro de licence doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le numéro de licence ne peut pas dépasser 50 caractères' })
  licenseNumber: string;

  @IsOptional()
  @IsString({ message: 'Le chemin de la photo doit être une chaîne de caractères' })
  photo?: string;
}