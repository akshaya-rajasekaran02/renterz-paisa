import { USER_KEY } from '../constants/app'
import api from './api'
import { userService } from './userService'

function readSessionUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const profileService = {
  async updateMyProfile(payload) {
    try {
      const { data } = await api.put('/api/common/users/me', payload)
      return data
    } catch {
      const current = readSessionUser()
      if (!current?.id) throw new Error('Unable to update profile')
      return userService.updateProfileById(current.id, payload)
    }
  },

  async changeMyPassword(payload) {
    try {
      const { data } = await api.put('/auth/change-password', payload)
      return data
    } catch {
      const current = readSessionUser()
      if (!current?.id) throw new Error('Unable to change password')
      return userService.changePasswordById(current.id, payload.currentPassword, payload.newPassword)
    }
  },
}
