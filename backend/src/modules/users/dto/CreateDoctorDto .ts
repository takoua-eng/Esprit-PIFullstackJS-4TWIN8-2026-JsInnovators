export class CreateDoctorDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  specialization: string;
  licenseNumber: string;

  photo?: string;
}