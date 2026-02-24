import { RENTS_KEY } from '../constants/app'
import api from './api'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'
const emptyRentSeed = []
const LEGACY_RENT_SEED_SIGNATURES = new Set([
  'mia johnson|A-303|2026-02-05|1800',
  'ethan clarke|A-101|2026-02-05|1450',
  'sophia reed|D-411|2026-02-10|1600',
])

function isLegacyRentSeed(item) {
  const tenant = String(item?.tenant || '').trim().toLowerCase()
  const unit = String(item?.unit || '').trim().toUpperCase()
  const dueDate = String(item?.dueDate || '').trim()
  const amount = Number(item?.amount || 0)
  const signature = `${tenant}|${unit}|${dueDate}|${amount}`
  const hasLegacyId = [1, 2, 3].includes(Number(item?.id))
  const hasNoMeta = !item?.source && !item?.createdAt && !item?.updatedAt
  return hasLegacyId && hasNoMeta && LEGACY_RENT_SEED_SIGNATURES.has(signature)
}

function normalizeRentPeriod(item) {
  const base = item?.createdAt || item?.periodStart || item?.updatedAt || new Date().toISOString()
  const period = getOneMonthRentPeriod(base)
  return {
    ...item,
    periodStart: period.startDate,
    periodEnd: period.endDate,
    dueDate: period.endDate,
    status: item?.status || deriveStatus(period.endDate),
  }
}

function readRents() {
  try {
    const raw = localStorage.getItem(RENTS_KEY)
    if (!raw) {
      localStorage.setItem(RENTS_KEY, JSON.stringify(emptyRentSeed))
      return [...emptyRentSeed]
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.setItem(RENTS_KEY, JSON.stringify(emptyRentSeed))
      return [...emptyRentSeed]
    }
    const sanitized = parsed
      .filter((item) => !isLegacyRentSeed(item))
      .map(normalizeRentPeriod)
    if (JSON.stringify(sanitized) !== JSON.stringify(parsed)) {
      localStorage.setItem(RENTS_KEY, JSON.stringify(sanitized))
    }
    return sanitized
  } catch {
    localStorage.setItem(RENTS_KEY, JSON.stringify(emptyRentSeed))
    return [...emptyRentSeed]
  }
}

function writeRents(records) {
  localStorage.setItem(RENTS_KEY, JSON.stringify(records))
}

function toIsoDate(value = new Date()) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function addOneMonth(value = new Date()) {
  const parsed = new Date(value)
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  base.setMonth(base.getMonth() + 1)
  return toIsoDate(base)
}

export function getOneMonthRentPeriod(value = new Date()) {
  const startDate = toIsoDate(value)
  const endDate = addOneMonth(value)
  return { startDate, endDate }
}

function deriveStatus(dueDate) {
  const target = new Date(dueDate).setHours(0, 0, 0, 0)
  const today = new Date().setHours(0, 0, 0, 0)
  return target < today ? 'OVERDUE' : 'PENDING'
}

/**
 * Maps backend rent DTO to frontend rent table row shape.
 */
function toRentItem(item) {
  const createdAt = item.createdAt || new Date().toISOString()
  const period = getOneMonthRentPeriod(createdAt)
  const periodStart = item.periodStart || period.startDate
  const periodEnd = item.periodEnd || period.endDate
  return {
    id: item.rentId,
    allocationId: item.allocationId,
    unitId: item.unitId ?? null,
    unit: item.unitNumber || '-',
    tenant: item.tenantName || 'Tenant',
    tenantEmail: item.tenantEmail || '',
    periodStart,
    periodEnd,
    dueDate: periodEnd,
    amount: Number(item.amount || 0),
    status: item.status || deriveStatus(periodEnd),
    userId: item.tenantId ?? null,
    userEmail: item.tenantEmail || '',
    createdAt,
  }
}

export const rentService = {
  /**
   * Loads rents from role-specific backend endpoints.
   */
  async listRentsRemote(role) {
    try {
      const endpoint = role === 'OWNER' ? '/api/owner/rents' : '/api/tenant/rents'
      const { data } = await api.get(endpoint)
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toRentItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return readRents()
    }
  },

  listRents() {
    return readRents()
  },

  upsertRent(payload) {
    const rents = readRents()
    const unit = String(payload.unit || '').trim()
    const tenant = String(payload.tenant || '').trim()
    const normalizedTenantEmail = String(payload.tenantEmail || '').trim().toLowerCase()
    const amount = Number(payload.amount) || 0
    const createdAt = new Date().toISOString()
    const period = getOneMonthRentPeriod(createdAt)
    const dueDate = period.endDate

    if (!unit || !tenant || amount <= 0) {
      throw new Error('Tenant, unit and valid amount are required')
    }

    const nextItem = {
      id: Date.now(),
      unitId: payload.unitId || null,
      tenant,
      unit,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      dueDate,
      amount,
      status: deriveStatus(dueDate),
      userId: payload.userId || null,
      userEmail: normalizedTenantEmail,
      tenantEmail: normalizedTenantEmail,
      createdByUserId: payload.createdByUserId || null,
      createdByUserEmail: String(payload.createdByUserEmail || '').trim().toLowerCase(),
      source: payload.source || 'MANUAL',
      createdAt,
    }

    const matchIndex = rents.findIndex((entry) => {
      const sameUnit = String(entry.unit || '').trim().toUpperCase() === unit.toUpperCase()
      const sameDueDate = String(entry.dueDate || '').trim() === dueDate
      const sameEmail = normalizedTenantEmail && String(entry.userEmail || '').trim().toLowerCase() === normalizedTenantEmail
      const sameTenantName = !normalizedTenantEmail && String(entry.tenant || '').trim().toLowerCase() === tenant.toLowerCase()
      return sameUnit && sameDueDate && (sameEmail || sameTenantName)
    })

    let updated
    if (matchIndex >= 0) {
      const current = rents[matchIndex]
      const merged = {
        ...current,
        ...nextItem,
        id: current.id,
        updatedAt: new Date().toISOString(),
      }
      updated = rents.map((entry, index) => (index === matchIndex ? merged : entry))
    } else {
      updated = [nextItem, ...rents]
    }

    writeRents(updated)
    return matchIndex >= 0 ? updated[matchIndex] : nextItem
  },
}
