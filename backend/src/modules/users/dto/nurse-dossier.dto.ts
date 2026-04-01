export class NurseDossierDto {
  admissionDate?: string;
  dischargeDate?: string;
  dischargeUnit?: string;
  primaryDiagnosis?: string;
  hospitalizationReason?: string;
  secondaryDiagnoses?: string;
  proceduresPerformed?: string;
  dischargeSummaryNotes?: string;
  diagnosisEntries?: unknown[];
  bloodType?: string;
  currentMedications?: string;
  allergies?: string;
  pastMedicalHistory?: string;
  substanceUse?: string;
  familyHistory?: string;
}
