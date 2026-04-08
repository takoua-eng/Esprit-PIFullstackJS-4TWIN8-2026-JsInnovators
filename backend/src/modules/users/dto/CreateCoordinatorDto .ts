export class CreateCoordinatorDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  assignedService?: string;
  responsibilities?: string;

  photo?: string;
}