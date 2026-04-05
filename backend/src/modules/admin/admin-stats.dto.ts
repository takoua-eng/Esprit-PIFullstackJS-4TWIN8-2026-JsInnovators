export interface AdminStatsDto {
  totalPatients: number;
  totalPhysicians: number;
  totalNurses: number;
  totalCoordinators: number;
  totalAuditors: number;
  /** Patients inscrits depuis le 1er jour du mois courant (createdAt). */
  patientsThisMonth: number;
  /** Utilisateurs non archivés créés depuis le lundi 00:00 de la semaine courante (createdAt). */
  newUsersThisWeek: number;
  /** Patients dont la dernière activité (updatedAt) est dans les N derniers jours (voir ACTIVE_PATIENT_DAYS). */
  activePatients: number;
}
