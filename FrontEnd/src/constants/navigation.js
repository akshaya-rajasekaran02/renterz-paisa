import { Building2, Gauge, IndianRupee, LayoutGrid, MessageSquareWarning, Users, Wallet } from 'lucide-react'
import { ROLES } from './roles'

export const NAV_ITEMS = [
  { label: 'Super Admin', to: '/super-admin', icon: Gauge, roles: [ROLES.SUPER_ADMIN] },
  { label: 'Dashboard', to: '/dashboard', icon: Gauge, roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
  { label: 'Properties', to: '/properties', icon: Building2, roles: [ROLES.BUILDING_ADMIN] },
  { label: 'Units', to: '/units', icon: LayoutGrid, roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER] },
  { label: 'Users', to: '/users', icon: Users, roles: [ROLES.BUILDING_ADMIN] },
  { label: 'Rent', to: '/rent', icon: Wallet, roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
  { label: 'Payments', to: '/payments', icon: IndianRupee, roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
  { label: 'Complaints', to: '/complaints', icon: MessageSquareWarning, roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
  { label: 'Owner Module', to: '/owner', icon: Building2, roles: [ROLES.OWNER] },
]

export const EXTRA_NAV_ITEMS = [
  { label: 'Maintenance', to: '/maintenance', roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER] },
  { label: 'Damage Reports', to: '/damage-reports', roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
  { label: 'Communication', to: '/communication', roles: [ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT] },
]
