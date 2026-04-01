import { NavItem } from '../../../../layouts/full/sidebar/nav-item/nav-item';

export const superAdminNavItems: NavItem[] = [
  { navCap: 'SUPER_ADMIN_MENU' },
  {
    displayName: 'DASHBOARD',
    iconName: 'gauge',
    route: '/super-admin/dashboard',
    bgcolor: 'primary',
  },
  {
    displayName: 'MANAGE_USERS',
    iconName: 'users',
    route: '/super-admin/users',
    bgcolor: 'secondary',
    children: [
      {
        displayName: 'ADMINS',
        iconName: 'shield-lock',
        route: '/super-admin/admin-users',
      },
      {
        displayName: 'PATIENTS',
        iconName: 'notes',
        route: '/super-admin/patients',
      },
      {
        displayName: 'MEDECINS',
        iconName: 'stethoscope',
        route: '/super-admin/medecins',
      },
      {
        displayName: 'NURSES',
        iconName: 'nurse',
        route: '/super-admin/nurses',
      },
      {
        displayName: 'COORDINATORS',
        iconName: 'users-group',
        route: '/super-admin/coordinateurs',
      },
      {
        displayName: 'AUDITORS',
        iconName: 'check',
        route: '/super-admin/auditors',
      },
      {
        displayName: 'PROFILE',
        iconName: 'user',
        route: '/super-admin/profile',
      },
    ],
  },
  {
    displayName: 'REPORTS',
    iconName: 'report-analytics',
    route: '/super-admin/reports',
    bgcolor: 'warning',
  },
  {
    displayName: 'SETTINGS',
    iconName: 'settings',
    route: '/super-admin/settings',
    bgcolor: 'success',
  },
];
