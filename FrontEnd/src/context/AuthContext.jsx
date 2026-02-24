import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { ROLES } from '../constants/roles'
import { setUnauthorizedHandler } from '../services/api'
import { TOKEN_KEY, USER_KEY } from '../constants/app'
import { buildSessionUser, isTokenExpired, parseJwt } from '../utils/jwt'
import { AuthContext } from './authContextInstance'
import { presenceService } from '../services/presenceService'

/**
 * Normalizes backend and legacy role labels into app role constants.
 */
function normalizeAppRole(rawRole) {
  const value = String(rawRole || '').trim().toUpperCase()
  if (!value) return ''
  if (value === 'ADMIN' || value === 'BUILDING_ADMIN' || value === 'BUILDINGADMIN') return ROLES.BUILDING_ADMIN
  if (value === 'SUPERADMIN' || value === 'SUPER_ADMIN') return ROLES.SUPER_ADMIN
  return value
}

function readStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

function readStoredUser() {
  const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(() => {
    const tokenFromStorage = readStoredToken()
    if (!tokenFromStorage || isTokenExpired(tokenFromStorage)) return null
    try {
      const saved = readStoredUser()
      return buildSessionUser(tokenFromStorage, saved)
    } catch {
      return buildSessionUser(tokenFromStorage, null)
    }
  })
  const [loading, setLoading] = useState(false)

  const logout = useCallback(() => {
    presenceService.stop()
    setToken(null)
    setUser(null)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!token) return undefined

    if (isTokenExpired(token)) {
      logout()
      return undefined
    }

    const payload = parseJwt(token)
    const msLeft = payload?.exp ? payload.exp * 1000 - Date.now() : 0

    if (msLeft <= 0) {
      logout()
      return undefined
    }

    const timer = setTimeout(() => logout(), msLeft)
    return () => clearTimeout(timer)
  }, [token, logout])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const syncProfile = async () => {
      try {
        const me = await authService.me()
        if (cancelled || !me) return
        const payloadUser = buildSessionUser(token, me)
        if (!payloadUser) return
        const mergedUser = {
          ...payloadUser,
          id: me.id ?? payloadUser.id ?? null,
          fullName: me.fullName || payloadUser.fullName,
          email: me.email || payloadUser.email,
          mobile: me.mobile || payloadUser.mobile || '',
          role: normalizeAppRole(me.role || payloadUser.role),
          buildingStatus: me.buildingStatus || null,
          buildingName: me.buildingName || payloadUser.buildingName || '',
        }
        if (mergedUser.role !== ROLES.SUPER_ADMIN && mergedUser.buildingStatus && mergedUser.buildingStatus !== 'ACTIVE') {
          logout()
          return
        }
        setUser(mergedUser)
        sessionStorage.setItem(USER_KEY, JSON.stringify(mergedUser))
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          logout()
        }
      }
    }

    syncProfile()
    return () => {
      cancelled = true
    }
  }, [token, logout])

  useEffect(() => {
    if (!token || !user) {
      presenceService.stop()
      return undefined
    }

    presenceService.start(user)
    return () => presenceService.stop()
  }, [token, user])

  const persistSession = useCallback((sessionToken, sessionUser) => {
    const jwtUser = buildSessionUser(sessionToken, sessionUser)
    if (!jwtUser) {
      throw new Error('Invalid token payload. Missing role claim.')
    }
    setToken(sessionToken)
    setUser(jwtUser)
    sessionStorage.setItem(TOKEN_KEY, sessionToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(jwtUser))
    // Migration cleanup for older storage behavior.
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return jwtUser
  }, [])

  const login = useCallback(async (payload) => {
    setLoading(true)
    try {
      const response = await authService.login(payload)
      const sessionUser = persistSession(response.token, response.user)
      return { ...response, user: sessionUser }
    } finally {
      setLoading(false)
    }
  }, [persistSession])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setSessionUser: (nextUser) => {
        setUser(nextUser)
        sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      },
    }),
    [token, user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
