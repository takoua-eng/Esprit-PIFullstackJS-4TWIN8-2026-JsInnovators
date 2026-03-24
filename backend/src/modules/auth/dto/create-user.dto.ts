export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string; // 👈 nom du rôle (ex: "admin")
}