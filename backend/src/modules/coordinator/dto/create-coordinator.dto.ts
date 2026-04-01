export class CreateCoordinatorDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  specialization?: string;
  yearsExperience?: number;
}