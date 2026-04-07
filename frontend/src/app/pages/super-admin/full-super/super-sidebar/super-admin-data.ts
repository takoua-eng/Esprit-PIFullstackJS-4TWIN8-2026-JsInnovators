import { NavItem } from '../../../../layouts/full/sidebar/nav-item/nav-item';

export const superAdminNavItems: NavItem[] = [
  { navCap: 'SUPER_ADMIN_MENU' },
  {
    displayName: 'DASHBOARD',
    iconName: 'gauge',
    route: '/super-admin/dashboard',
    bgcolor: 'primary',
    permission: 'dashboard:read',
  },
  {
    displayName: 'MANAGE_USERS',
    iconName: 'users',
    route: '/super-admin/users',
    bgcolor: 'secondary',
    permission: 'users:read',
  },
  {
    displayName: 'SERVICES',
    iconName: 'building-hospital',
    route: '/super-admin/services',
    bgcolor: 'info',
    permission: 'services:read',
  },
  {
    displayName: 'ROLES',
    iconName: 'shield-check',
    route: '/super-admin/role',
    bgcolor: 'warning',
    permission: 'users:manage',
  },
  {
    displayName: 'AUDIT_LOGS',
    iconName: 'camera',
    route: '/super-admin/audit-logs',
    bgcolor: 'error',
    permission: 'audit:read',
  },
];

export const auditorNavItems: NavItem[] = [
  { navCap: 'AUDITOR_MENU' },
  {
    displayName: 'AUDIT_LOGS',
    iconName: 'camera',
    route: '/super-admin/audit-logs',
    bgcolor: 'primary',
    permission: 'audit:read',
  },
  {
    displayName: 'PROFILE',
    iconName: 'user',
    route: '/super-admin/profile',
    bgcolor: 'secondary',
  },
];
