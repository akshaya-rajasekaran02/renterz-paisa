import { ONLINE_PRESENCE_KEY } from '../constants/app'

const SESSION_KEY = 'rp_presence_session_id'
const HEARTBEAT_MS = 15000
const STALE_MS = 45000

let heartbeatTimer = null
let unloadHandler = null

function now() {
  return Date.now()
}

function getSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const next = `${now()}_${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(SESSION_KEY, next)
  return next
}

function readPresence() {
  try {
    const raw = localStorage.getItem(ONLINE_PRESENCE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writePresence(records) {
  localStorage.setItem(ONLINE_PRESENCE_KEY, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent('rp_presence_updated'))
}

function prune(records) {
  const cutoff = now() - STALE_MS
  return Object.fromEntries(
    Object.entries(records).filter(([, entry]) => Number(entry?.lastSeen || 0) >= cutoff)
  )
}

function touch(user) {
  if (!user) return
  const sessionId = getSessionId()
  const current = prune(readPresence())
  current[sessionId] = {
    userId: user.id || null,
    email: String(user.email || '').toLowerCase(),
    fullName: String(user.fullName || ''),
    lastSeen: now(),
  }
  writePresence(current)
}

function removeCurrentSession() {
  const sessionId = getSessionId()
  const current = prune(readPresence())
  if (!current[sessionId]) return
  delete current[sessionId]
  writePresence(current)
}

export const presenceService = {
  start(user) {
    if (!user) return
    this.stop()
    touch(user)
    heartbeatTimer = window.setInterval(() => touch(user), HEARTBEAT_MS)
    unloadHandler = () => removeCurrentSession()
    window.addEventListener('beforeunload', unloadHandler)
  },

  stop() {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (unloadHandler) {
      window.removeEventListener('beforeunload', unloadHandler)
      unloadHandler = null
    }
    removeCurrentSession()
  },

  countOnlineUsers() {
    const cleaned = prune(readPresence())
    writePresence(cleaned)
    const unique = new Set(
      Object.values(cleaned)
        .map((entry) => entry?.userId || entry?.email)
        .filter(Boolean)
    )
    return unique.size
  },

  subscribe(callback) {
    const onStorage = (event) => {
      if (event.key && event.key !== ONLINE_PRESENCE_KEY) return
      callback()
    }
    const onCustom = () => callback()
    window.addEventListener('storage', onStorage)
    window.addEventListener('rp_presence_updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('rp_presence_updated', onCustom)
    }
  },
}
