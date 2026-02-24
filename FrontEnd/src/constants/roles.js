export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  BUILDING_ADMIN: 'BUILDING_ADMIN',
  // Backward-compatible alias for older code paths.
  ADMIN: 'BUILDING_ADMIN',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
}

export const ALL_ROLES = Array.from(new Set(Object.values(ROLES)))

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'SUPER_ADMIN',
  [ROLES.BUILDING_ADMIN]: 'ADMIN',
  [ROLES.OWNER]: 'OWNER',
  [ROLES.TENANT]: 'TENANT',
}

export const ROLE_HOME_PATH = {
  [ROLES.SUPER_ADMIN]: '/super-admin',
  [ROLES.BUILDING_ADMIN]: '/dashboard',
  [ROLES.OWNER]: '/dashboard',
  [ROLES.TENANT]: '/dashboard',
}
