import { NavItem } from './nav-item/nav-item';

// Sidebar pour l'admin
export const adminNavItems: NavItem[] = [
  { navCap: 'ADMIN' },
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
      { displayName: 'PATIENTS', iconName: 'notes', route: '/dashboard/admin/patients', bgcolor: 'transparent' },
      { displayName: 'DOCTORS', iconName: 'stethoscope', route: '/dashboard/admin/physicians', bgcolor: 'transparent' },
      { displayName: 'NURSES', iconName: 'nurse', route: '/dashboard/admin/nurses', bgcolor: 'transparent' },
      { displayName: 'COORDINATORS', iconName: 'users-group', route: '/dashboard/admin/coordinators', bgcolor: 'transparent' },
      { displayName: 'AUDITORS', iconName: 'check', route: '/dashboard/admin/auditors', bgcolor: 'transparent' },
    ],
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
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'NEW',
  },

  {
    displayName: 'MY PATIENTS',
    iconName: 'users-group',
    route: '/admin/coordinator/patients',
    bgcolor: 'transparent',
  },

  {
    displayName: 'REMINDERS',
    iconName: 'bell-ringing',
    route: '/admin/coordinator/reminders',
    bgcolor: 'transparent',
  },
];



