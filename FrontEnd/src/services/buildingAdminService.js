import api from './api'
import { USER_KEY } from '../constants/app'
import { ROLES } from '../constants/roles'
import { userService } from './userService'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Reads the authenticated user cached in browser storage.
 */
function readSessionUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function makeTempPassword() {
  return `Temp@${Math.random().toString(36).slice(-8)}`
}

/**
 * Converts backend user DTO fields to the frontend user shape.
 */
function toFrontendUser(user) {
  return {
    id: user?.userId ?? user?.id ?? null,
    fullName: user?.name || user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    role: user?.role === 'ADMIN' ? ROLES.BUILDING_ADMIN : user?.role,
  }
}

/**
 * Maps form payload to backend user-create request format.
 */
function toCreateUserRequest(payload) {
  return {
    name: String(payload.fullName || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    mobile: String(payload.mobile || '').replace(/\D/g, '').slice(0, 15),
    password: String(payload.password || ''),
    profileImageUrl: '',
  }
}

export const buildingAdminService = {
  async listUsers() {
    try {
      const { data } = await api.get('/api/admin/users')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toFrontendUser)
    } catch (error) {
      if (!useDemoAuth) throw error
      const current = readSessionUser()
      return userService
        .listUsers()
        .filter((item) => Number(item.buildingId) === Number(current?.buildingId))
    }
  },

  async createUser(payload) {
    try {
      const request = toCreateUserRequest(payload)
      if (!request.mobile) {
        throw new Error('Mobile number is required for backend user creation')
      }
      const endpoint = payload.role === ROLES.OWNER ? '/api/admin/users/owners' : '/api/admin/users/tenants'
      const { data } = await api.post(endpoint, request)
      return toFrontendUser(data)
    } catch (error) {
      if (!useDemoAuth) throw error
      const current = readSessionUser()
      return userService.addUser({
        ...payload,
        role: [ROLES.OWNER, ROLES.TENANT].includes(payload.role) ? payload.role : ROLES.TENANT,
        buildingId: current?.buildingId ?? null,
      })
    }
  },

  async removeUser(userId) {
    try {
      await api.delete(`/api/admin/users/${userId}`)
    } catch (error) {
      if (!useDemoAuth) throw error
      userService.removeUser(Number(userId))
    }
  },

  async resetPassword(userId) {
    try {
      const { data } = await api.post(`/api/admin/users/${userId}/reset-password`)
      return data
    } catch (error) {
      if (!useDemoAuth) throw error
      const temporaryPassword = makeTempPassword()
      userService.resetPassword(Number(userId), temporaryPassword)
      return { temporaryPassword }
    }
  },
}
