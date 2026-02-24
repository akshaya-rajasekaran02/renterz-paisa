export const TOKEN_KEY = 'rp_access_token'
export const USER_KEY = 'rp_user'
export const USERS_KEY = 'rp_users'
export const DAMAGE_REPORTS_KEY = 'rp_damage_reports'
export const PAYMENTS_KEY = 'rp_payments'
export const OWNER_COMPLAINTS_KEY = 'rp_owner_complaints'
export const UNIT_ALLOCATIONS_KEY = 'rp_unit_allocations'
export const MAINTENANCE_BILLS_KEY = 'rp_maintenance_bills'
export const PROPERTIES_KEY = 'rp_properties'
export const UNITS_KEY = 'rp_units'
export const UNIT_AUDIT_KEY = 'rp_unit_audit'
export const RENTS_KEY = 'rp_rents'
export const ONLINE_PRESENCE_KEY = 'rp_online_presence'

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 12000,
}
