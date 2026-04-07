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
  { displayName: 'AUDITOR_DASHBOARD',    iconName: 'gauge',          route: '/auditor/dashboard',    bgcolor: 'primary' },
  { displayName: 'AUDITOR_PATIENTS',     iconName: 'users',          route: '/auditor/patients',     bgcolor: 'secondary', permission: 'audit:read' },
  { displayName: 'AUDITOR_COORDINATORS', iconName: 'users-group',    route: '/auditor/coordinators', bgcolor: 'warning',   permission: 'audit:read' },
  { displayName: 'AUDITOR_REMINDERS',    iconName: 'bell',           route: '/auditor/reminders',    bgcolor: 'error',     permission: 'audit:read' },
  { displayName: 'AUDITOR_ANOMALIES',    iconName: 'alert-triangle', route: '/auditor/anomalies',    bgcolor: 'error',     permission: 'audit:read' },
  { displayName: 'AUDIT_LOGS',           iconName: 'camera',         route: '/auditor/logs',         bgcolor: 'info',      permission: 'audit:read' },
  { displayName: 'AUDITOR_VERIFY',       iconName: 'shield-check',   route: '/auditor/verify',       bgcolor: 'success',   permission: 'audit:read' },
  { displayName: 'PROFILE',             iconName: 'user',           route: '/auditor/profile',      bgcolor: 'secondary' },
];
