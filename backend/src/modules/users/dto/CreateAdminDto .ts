export class CreateAdminDto {
  // 🔐 Authentification
  email: string;
  password: string;

  // 👤 Informations personnelles
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  address: string;
  nationalId: string;
  photo?: string;

  // 🏥 Service
  serviceId: string;

  // 📊 Statut
  isActive?: boolean;
}
