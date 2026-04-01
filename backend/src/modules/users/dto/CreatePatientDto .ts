export class CreatePatientDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dateOfBirth: string; // 🔥 ajouté
  medicalRecordNumber: string;
  emergencyContact: string;
  nationalId?: string;

  address?: string;

  maritalStatus?: string;

  photo?: string;
}
