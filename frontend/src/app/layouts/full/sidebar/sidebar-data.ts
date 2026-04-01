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
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'NEW',
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
        bgcolor: 'tranparent',
      },
      {
        displayName: 'PHYSICIANS',
        iconName: 'stethoscope',
        route: '/dashboard/admin/physicians',
        bgcolor: 'tranparent',
      },
      {
        displayName: 'NURSES',
        iconName: 'nurse',
        route: '/dashboard/admin/nurses',
        bgcolor: 'tranparent',
      },
      {
        displayName: 'COORDINATORS',
        iconName: 'users-group',
        route: '/dashboard/admin/coordinators',
        bgcolor: 'tranparent',
      },
      {
        displayName: 'AUDITORS',
        iconName: 'check',
        route: '/dashboard/admin/auditors',
        bgcolor: 'tranparent',
      },
    ],
  },
  {
    displayName: 'PROFILE',
    iconName: 'user',
    route: '/dashboard/profile',
    bgcolor: 'warning',
  },
];

export const patientNavItems: NavItem[] = [
  {
    navCap: 'PATIENT',
  },
  {
    displayName: 'Dashboard',
    iconName: 'gauge',
    route: '/dashboard/patient/dashboard',
    bgcolor: 'primary',
  },
  {
    displayName: 'Vital Parameters',
    iconName: 'heartbeat',
    route: '/dashboard/patient/parameters',
    bgcolor: 'success',
  },
  {
    displayName: 'Symptoms',
    iconName: 'activity',
    route: '/dashboard/patient/symptoms',
    bgcolor: 'error',
  },
  {
    displayName: 'Questionnaires',
    iconName: 'clipboard-list',
    route: '/dashboard/patient/questionnaires',
    bgcolor: 'primary',
  },
  {
    displayName: 'History',
    iconName: 'history',
    route: '/dashboard/patient/history',
    bgcolor: 'secondary',
  },
  {
    displayName: 'Messages',
    iconName: 'message',
    route: '/dashboard/patient/messages',
    bgcolor: 'warning',
  },
  {
    displayName: 'Alerts',
    iconName: 'bell',
    route: '/dashboard/patient/alerts',
    bgcolor: 'error',
  },
  {
    displayName: 'Profile',
    iconName: 'user',
    route: '/dashboard/patient/profile',
    bgcolor: 'accent',
  },
];

// For backward compatibility, keep navItems as adminNavItems
export const navItems = adminNavItems;
