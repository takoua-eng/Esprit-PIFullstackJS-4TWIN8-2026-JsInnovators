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
    route: '/dashboard/coordinator',
    bgcolor: 'primary',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'NEW',
  },
  {
    displayName: 'MANAGE',
    iconName: 'users',
    route: '/dashboard/coordinator',
    bgcolor: 'secondary',
    children: [
      { displayName: 'PATIENTS', iconName: 'notes', route: '/dashboard/coordinator/patients', bgcolor: 'transparent' },
      { displayName: 'DOCTORS', iconName: 'stethoscope', route: '/dashboard/coordinator/physicians', bgcolor: 'transparent' },
      { displayName: 'NURSES', iconName: 'nurse', route: '/dashboard/coordinator/nurses', bgcolor: 'transparent' },
    ],
  },


];

