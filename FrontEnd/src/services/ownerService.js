import { MAINTENANCE_BILLS_KEY, OWNER_COMPLAINTS_KEY } from '../constants/app'
import { ROLES } from '../constants/roles'
import { complaintSeed, maintenanceSeed } from './mockData'
import { inventoryService } from './inventoryService'
import { rentService } from './rentService'
import api from './api'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

function assertOwner(user) {
  if (!user || user.role !== ROLES.OWNER) {
    throw new Error('Forbidden: OWNER role required')
  }
}

function readCollection(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return [...seed]
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(seed))
      return [...seed]
    }
    return parsed
  } catch {
    localStorage.setItem(key, JSON.stringify(seed))
    return [...seed]
  }
}

function writeCollection(key, records) {
  localStorage.setItem(key, JSON.stringify(records))
}

function isOwnedByUser(unit, user) {
  const byProfileEmail = unit.ownerProfile?.email && unit.ownerProfile.email.toLowerCase() === user.email?.toLowerCase()
  const byNameFallback = unit.owner && unit.owner.toLowerCase() === user.fullName?.toLowerCase()
  return Boolean(byProfileEmail || byNameFallback)
}

export const ownerService = {
  /**
   * Loads owner units from backend and maps them to unit-table shape.
   */
  async listOwnedUnitsRemote() {
    try {
      const { data } = await api.get('/api/owner/units')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map((item) => ({
        id: item.unitId,
        unitNo: item.unitNumber,
        propertyId: item.propertyId,
        property: `Property-${item.propertyId}`,
        floor: item.floor,
        owner: '',
        tenant: '',
        status: item.status,
      }))
    } catch (error) {
      if (!useDemoAuth) throw error
      return []
    }
  },

  getOwnedUnits(user) {
    assertOwner(user)
    const units = inventoryService.getUnits()
    return units.filter((unit) => isOwnedByUser(unit, user))
  },

  getMaintenanceBills(user) {
    assertOwner(user)
    const ownedUnits = this.getOwnedUnits(user)
    const ownedUnitIds = ownedUnits.map((unit) => unit.id)
    const bills = readCollection(MAINTENANCE_BILLS_KEY, maintenanceSeed)
    return bills.filter((bill) => ownedUnitIds.includes(bill.unitId))
  },

  getMyComplaints(user) {
    assertOwner(user)
    const complaints = readCollection(OWNER_COMPLAINTS_KEY, complaintSeed)
    return complaints
      .filter((item) => item.createdByUserId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  raiseComplaint(user, payload) {
    assertOwner(user)
    const unitId = Number(payload.unitId)
    if (!unitId || !payload.title?.trim() || !payload.description?.trim()) {
      throw new Error('Unit, title and description are required')
    }

    const ownedUnitIds = this.getOwnedUnits(user).map((unit) => unit.id)
    if (!ownedUnitIds.includes(unitId)) {
      throw new Error('Forbidden: complaint can only be raised for owned units')
    }

    const complaints = readCollection(OWNER_COMPLAINTS_KEY, complaintSeed)
    const nextComplaint = {
      id: Date.now(),
      unitId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: 'OPEN',
      createdByUserId: user.id,
      createdAt: new Date().toISOString(),
    }
    const updated = [nextComplaint, ...complaints]
    writeCollection(OWNER_COMPLAINTS_KEY, updated)
    return nextComplaint
  },

  assignRentToTenant(user, payload) {
    assertOwner(user)
    const unitId = Number(payload.unitId)
    const amount = Number(payload.amount)

    if (!unitId || amount <= 0) {
      throw new Error('Unit and valid amount are required')
    }

    const ownedUnit = this.getOwnedUnits(user).find((unit) => unit.id === unitId)
    if (!ownedUnit) {
      throw new Error('Forbidden: rent can only be assigned to your owned units')
    }
    if (!ownedUnit.tenant) {
      throw new Error('No tenant assigned to this unit yet')
    }

    return rentService.upsertRent({
      unitId: ownedUnit.id,
      unit: ownedUnit.unitNo,
      tenant: ownedUnit.tenant,
      tenantEmail: ownedUnit.tenantProfile?.email || '',
      userEmail: ownedUnit.tenantProfile?.email || '',
      amount,
      createdByUserId: user.id,
      createdByUserEmail: user.email || '',
      source: 'OWNER',
    })
  },
}
