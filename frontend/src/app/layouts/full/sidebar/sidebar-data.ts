import { NavItem } from './nav-item/nav-item';

// Sidebar pour l'admin
export const adminNavItems: NavItem[] = [
  { navCap: 'ADMIN' },
  {
    displayName: 'DASHBOARD',
    iconName: 'gauge',
    route: '/dashboard/admin',
    bgcolor: 'primary',
    permission: 'dashboard:read',
  },
  {
    displayName: 'USERS',
    iconName: 'users',
    route: '/dashboard/admin',
    bgcolor: 'secondary',
    permission: 'users:read',
    children: [
      { displayName: 'PATIENTS',     iconName: 'notes',        route: '/dashboard/admin/patients',    permission: 'patients:read' },
      { displayName: 'DOCTORS',      iconName: 'stethoscope',  route: '/dashboard/admin/physicians',  permission: 'doctors:read' },
      { displayName: 'NURSES',       iconName: 'nurse',        route: '/dashboard/admin/nurses',      permission: 'nurses:read' },
      { displayName: 'COORDINATORS', iconName: 'users-group',  route: '/dashboard/admin/coordinators',permission: 'coordinators:read' },
      { displayName: 'AUDITORS',     iconName: 'eye',          route: '/dashboard/admin/auditors',    permission: 'auditors:read' },
    ],
  },

  {
    displayName: 'QUESTIONNAIRE ',
    iconName: 'list',
    route: '/admin/templates',
    bgcolor: 'secondary',
  },
];

// Sidebar pour le coordinator

export const coordinatorNavItems: NavItem[] = [
  { navCap: 'COORDINATOR' },
  {
    displayName: 'DASHBOARD',
    iconName: 'gauge',
    route: '/admin/coordinator',
    bgcolor: 'primary',
    permission: 'dashboard:read',
  },
  {
    displayName: 'MY PATIENTS',
    iconName: 'users-group',
    route: '/admin/coordinator/patients',
    permission: 'patients:read',
  },
  {
    displayName: 'REMINDERS',
    iconName: 'bell-ringing',
    route: '/admin/coordinator/reminders',
    permission: 'reminders:send',
  },

  {
  displayName: 'AI PREDICTION',
  iconName: 'brain',
  route: '/admin/coordinator/prediction',
  bgcolor: 'transparent',
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
