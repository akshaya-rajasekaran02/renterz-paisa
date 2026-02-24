import { ROLES } from '../constants/roles'
import { USERS_KEY } from '../constants/app'

const defaultUsers = [
  {
    id: 1,
    fullName: 'Super Admin',
    email: 'superadmin@renterz.com',
    mobile: '9876543210',
    role: ROLES.SUPER_ADMIN,
    password: 'password123',
    buildingId: null,
  },
  {
    id: 2,
    fullName: 'Building Admin',
    email: 'buildingadmin@renterz.com',
    mobile: '9876543211',
    role: ROLES.BUILDING_ADMIN,
    password: 'password123',
    buildingId: 101,
  },
  {
    id: 3,
    fullName: 'Owner User',
    email: 'owner@renterz.com',
    mobile: '9876543212',
    role: ROLES.OWNER,
    password: 'password123',
    buildingId: 101,
  },
  {
    id: 4,
    fullName: 'Tenant User',
    email: 'tenant@renterz.com',
    mobile: '9876543213',
    role: ROLES.TENANT,
    password: 'password123',
    buildingId: 101,
  },
]

function ensureBaseUsers(users) {
  const byEmail = new Map(users.map((item) => [String(item.email || '').toLowerCase(), item]))
  let changed = false

  defaultUsers.forEach((seed) => {
    const key = seed.email.toLowerCase()
    if (!byEmail.has(key)) {
      users.push({ ...seed, source: 'SYSTEM_DEFAULT' })
      changed = true
    }
  })

  return { users, changed }
}

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    const seeded = defaultUsers.map((item) => ({ ...item, source: 'SYSTEM_DEFAULT' }))
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = defaultUsers.map((item) => ({ ...item, source: 'SYSTEM_DEFAULT' }))
      localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
      return seeded
    }
    const { users, changed } = ensureBaseUsers(parsed)
    if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return users
  } catch {
    const seeded = defaultUsers.map((item) => ({ ...item, source: 'SYSTEM_DEFAULT' }))
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
    return seeded
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function sanitizeUser(user) {
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

export const userService = {
  listUsers() {
    return readUsers().map(sanitizeUser)
  },

  findByCredentials(email, password) {
    const normalized = email.trim().toLowerCase()
    const user = readUsers().find((item) => item.email.toLowerCase() === normalized && item.password === password)
    return user ? sanitizeUser(user) : null
  },

  addUser(payload) {
    const users = readUsers()
    const email = payload.email.trim().toLowerCase()
    const mobile = payload.mobile?.trim() || ''
    const emailExists = users.some((item) => item.email.toLowerCase() === email)
    const mobileExists = mobile ? users.some((item) => (item.mobile || '').trim() === mobile) : false

    if (emailExists || mobileExists) {
      throw new Error('Email or mobile already used')
    }

    const nextUser = {
      id: Date.now(),
      fullName: payload.fullName.trim(),
      email,
      mobile,
      role: payload.role,
      password: payload.password,
      buildingId: payload.buildingId ?? null,
      age: payload.age ?? null,
      documentType: payload.documentType || '',
      documentNumber: payload.documentNumber || '',
      photo: payload.photo || '',
      documentFile: payload.documentFile || '',
      source: payload.source || 'ADMIN_MANUAL',
    }

    const nextUsers = [...users, nextUser]
    writeUsers(nextUsers)
    return sanitizeUser(nextUser)
  },

  assignBuildingById(id, buildingId) {
    const users = readUsers()
    const updatedUsers = users.map((item) => (
      item.id === id ? { ...item, buildingId } : item
    ))
    writeUsers(updatedUsers)
    const next = updatedUsers.find((item) => item.id === id)
    return next ? sanitizeUser(next) : null
  },

  removeUser(id) {
    const users = readUsers()
    const nextUsers = users.filter((item) => item.id !== id)
    writeUsers(nextUsers)
    return nextUsers.map(sanitizeUser)
  },

  findByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase()
    if (!normalized) return null
    const user = readUsers().find((item) => item.email.toLowerCase() === normalized)
    return user ? sanitizeUser(user) : null
  },

  resetPassword(id, nextPassword) {
    const users = readUsers()
    const updated = users.map((item) => (item.id === id ? { ...item, password: nextPassword } : item))
    writeUsers(updated)
    const target = updated.find((item) => item.id === id)
    return target ? sanitizeUser(target) : null
  },

  updateProfileById(id, payload) {
    const users = readUsers()
    const target = users.find((item) => item.id === id)
    if (!target) throw new Error('User not found')

    const nextEmail = String(payload.email || '').trim().toLowerCase()
    const nextMobile = String(payload.mobile || '').trim()

    if (!nextEmail) throw new Error('Email is required')
    const emailInUse = users.some((item) => item.id !== id && item.email.toLowerCase() === nextEmail)
    if (emailInUse) throw new Error('Email already used')

    if (nextMobile) {
      const mobileInUse = users.some((item) => item.id !== id && String(item.mobile || '').trim() === nextMobile)
      if (mobileInUse) throw new Error('Mobile already used')
    }

    const updatedUsers = users.map((item) => (
      item.id === id
        ? {
            ...item,
            fullName: String(payload.fullName || item.fullName).trim(),
            email: nextEmail,
            mobile: nextMobile,
          }
        : item
    ))
    writeUsers(updatedUsers)
    const next = updatedUsers.find((item) => item.id === id)
    return next ? sanitizeUser(next) : null
  },

  changePasswordById(id, currentPassword, nextPassword) {
    const users = readUsers()
    const target = users.find((item) => item.id === id)
    if (!target) throw new Error('User not found')
    if (target.password !== currentPassword) throw new Error('Current password is incorrect')
    if (!nextPassword || String(nextPassword).length < 8) throw new Error('New password must be at least 8 characters')

    const updatedUsers = users.map((item) => (
      item.id === id ? { ...item, password: String(nextPassword) } : item
    ))
    writeUsers(updatedUsers)
    const next = updatedUsers.find((item) => item.id === id)
    return next ? sanitizeUser(next) : null
  },
}
