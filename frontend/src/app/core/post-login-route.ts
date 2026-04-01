/**
 * Maps API role name (from JWT / login response, any casing) to the first screen for that role.
 */
export function normalizeRoleKey(role: string | null | undefined): string {
  return (role ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

/** Absolute app path (starts with `/`) for `router.navigateByUrl`. */
export function getPostLoginPath(roleFromApi: string | null | undefined): string {
  const r = normalizeRoleKey(roleFromApi);

  const map: Record<string, string> = {
    superadmin: '/super-admin/dashboard',
    coordinator: '/admin/coordinator',
    admin: '/dashboard/admin',
    patient: '/dashboard/patient',
    nurse: '/dashboard/admin/nurses',
    doctor: '/dashboard/admin/physicians',
    physician: '/dashboard/admin/physicians',
    auditor: '/dashboard/admin/auditors',
  };

  return map[r] ?? '/dashboard/admin';
}
