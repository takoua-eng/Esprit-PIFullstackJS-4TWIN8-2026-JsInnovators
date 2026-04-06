import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

/**
 * Garde commune pour l’admin « staff » (hors patient / coordinateur) :
 * dashboard `/dashboard/admin/...` et zone `/admin/templates/...`.
 */
export const staffAdminGuard = [
  authGuard,
  roleGuard(['admin', 'superadmin', 'nurse', 'doctor', 'physician', 'auditor']),
];
