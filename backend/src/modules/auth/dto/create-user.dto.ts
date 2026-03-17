export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string; // 'male', 'female', 'other'
  password: string;
  roleId: string; // id du rôle
  medicalRecordNumber?: string;
  specialization?: string;
  department?: string;
  assignedPatients?: string; // JSON string
  address?: string;
  emergencyContact?: string;
}