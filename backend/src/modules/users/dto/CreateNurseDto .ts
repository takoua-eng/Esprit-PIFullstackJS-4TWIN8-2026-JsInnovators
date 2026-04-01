export class CreateNurseDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  department: string;
  shift: string;

  photo?: string;
}