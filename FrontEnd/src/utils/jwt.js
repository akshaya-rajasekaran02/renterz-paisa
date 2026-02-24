export function parseJwt(token) {
  try {
    const base64 = token.split('.')[1]
    const payload = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

function normalizeRole(rawRole) {
  const role = String(rawRole || '').trim().toUpperCase()
  if (!role) return ''
  if (role === 'ADMIN') return 'BUILDING_ADMIN'
  if (role === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (role === 'BUILDINGADMIN') return 'BUILDING_ADMIN'
  return role
}

export function buildSessionUser(token, fallbackUser = null) {
  const payload = parseJwt(token)
  const role = normalizeRole(payload?.role || fallbackUser?.role)
  if (!role) return null
  return {
    id: payload?.userId ?? payload?.user_id ?? fallbackUser?.id ?? null,
    email: payload?.email ?? payload?.sub ?? fallbackUser?.email ?? '',
    fullName: fallbackUser?.fullName || payload.name || 'User',
    role,
    buildingId: payload?.buildingId ?? payload?.building_id ?? fallbackUser?.buildingId ?? null,
    buildingName: payload?.buildingName ?? payload?.building_name ?? fallbackUser?.buildingName ?? '',
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload?.exp) {
    return true
  }
  return Date.now() >= payload.exp * 1000
}

export function createDemoJwt(payload = {}, expiresInSeconds = 3600) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }))
  return `${header}.${body}.signature`
}
