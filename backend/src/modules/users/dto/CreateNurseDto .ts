export class CreateNurseDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  serviceId: string;

  address: string;
  nationalId: string;
  gender: string;
  phone: string;
  isActive?: boolean;
}
