export class CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  isSuperAdmin?: boolean;
  adminLevel?: string; // 🔥 new
  permissions?: string[];

  photo?: string;
}
