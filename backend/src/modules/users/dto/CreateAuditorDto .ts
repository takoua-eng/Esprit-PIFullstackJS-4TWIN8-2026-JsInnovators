// src/users/dto/CreateAuditorDto.ts
export class CreateAuditorDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // ✅ Nouveaux champs demandés
  address?: string;
  nationalId?: string;
  gender?: string;
  phone?: string;
  isActive?: boolean; // Par défaut: true
}
