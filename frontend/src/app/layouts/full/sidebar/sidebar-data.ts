import { NavItem } from './nav-item/nav-item';

export const adminNavItems: NavItem[] = [
  {
    navCap: 'ADMIN',
  },
  {
    displayName: 'DASHBOARD',
    iconName: 'gauge',
    route: '/dashboard/admin',
    bgcolor: 'primary',
  },
  {
    displayName: 'USERS',
    iconName: 'users',
    route: '/dashboard/admin',
    bgcolor: 'secondary',
    children: [
      {
        displayName: 'PATIENTS',
        iconName: 'notes',
        route: '/dashboard/admin/patients',
        bgcolor: 'transparent',
      },
      {
        displayName: 'PHYSICIANS',
        iconName: 'stethoscope',
        route: '/dashboard/admin/physicians',
        bgcolor: 'transparent',
      },
      {
        displayName: 'NURSES',
        iconName: 'nurse',
        route: '/dashboard/admin/nurses',
        bgcolor: 'transparent',
      },
      {
        displayName: 'COORDINATORS',
        iconName: 'users-group',
        route: '/dashboard/admin/coordinators',
        bgcolor: 'transparent',
      },
      {
        displayName: 'AUDITORS',
        iconName: 'check',
        route: '/dashboard/admin/auditors',
        bgcolor: 'transparent',
      },
    ],
  },
  {
    navCap: 'ACCOUNT',
  },
  {
    displayName: 'PROFILE',
    iconName: 'user',
    route: '/dashboard/profile',
    bgcolor: 'success',
  },
];

export const coordinatorNavItems: NavItem[] = [
  {
    navCap: 'COORDINATOR',
  },
  {
    displayName: 'DASHBOARD',
    iconName: 'layout-dashboard',
    route: '/dashboard/coordinator',
    bgcolor: 'primary',
  },
  {
    displayName: 'PROFILE',
    iconName: 'user',
    route: '/dashboard/profile',
    bgcolor: 'success',
  },
];

export function getNavItemsForRole(role: string | null): NavItem[] {
  if (role === 'Coordinator') {
    return coordinatorNavItems;
  }

  return adminNavItems;
}