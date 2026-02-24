import api from './api'
import { createDemoJwt } from '../utils/jwt'
import { userService } from './userService'
import { emailService } from './emailService'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Builds a frontend session payload from backend login response.
 */
function toSessionResponse(data) {
  return {
    token: data?.token,
    user: data?.user || {
      email: data?.email || '',
      role: data?.role || '',
    },
  }
}

export const authService = {
  async me() {
    try {
      const { data } = await api.get('/api/common/users/me')
      return {
        id: data?.userId ?? null,
        fullName: data?.name || '',
        email: data?.email || '',
        mobile: data?.mobile || '',
        role: data?.role || '',
        profileImageUrl: data?.profileImageUrl || '',
      }
    } catch (error) {
      if (!useDemoAuth) throw error
      // Demo users (for example SUPER_ADMIN) can run without backend identity endpoint.
      return null
    }
  },

  async login(credentials) {
    if (!useDemoAuth) {
      const { data } = await api.post('/auth/login', credentials)
      return toSessionResponse(data)
    }

    try {
      const { data } = await api.post('/auth/login', credentials)
      return toSessionResponse(data)
    } catch {
      const user = userService.findByCredentials(credentials.email, credentials.password)
      if (!user) {
        throw new Error('Invalid credentials')
      }
      return {
        token: createDemoJwt({
          sub: user.email,
          userId: user.id,
          role: user.role,
          buildingId: user.buildingId ?? null,
        }),
        user,
      }
    }
  },

  async requestPasswordReset(email) {
    const normalizedEmail = String(email || '').trim().toLowerCase()

    try {
      const { data } = await api.post('/auth/forgot-password', { email: normalizedEmail })
      return data
    } catch {
      const user = userService.findByEmail(normalizedEmail)
      if (!user) {
        return { message: 'If this email exists, a reset password email has been sent.' }
      }

      const temporaryPassword = `Temp@${Math.random().toString(36).slice(-8)}`
      userService.resetPassword(user.id, temporaryPassword)

      try {
        await emailService.sendRecoveryPassword({
          toEmail: normalizedEmail,
          toName: user.fullName,
          temporaryPassword,
        })
      } catch (error) {
        return {
          message: error?.message || 'Temporary password generated, but email could not be sent.',
          temporaryPassword,
        }
      }

      return {
        message: 'Recovery password sent to your email.',
      }
    }
  },
}
