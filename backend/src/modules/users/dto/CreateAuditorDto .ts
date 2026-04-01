export class CreateAuditorDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  auditLevel: string;

  photo?: string;
}