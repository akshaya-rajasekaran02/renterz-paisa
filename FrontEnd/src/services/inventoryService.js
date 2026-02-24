import { PROPERTIES_KEY, UNITS_KEY, UNIT_AUDIT_KEY } from '../constants/app'
import { propertiesSeed, unitsSeed } from './mockData'
import { userService } from './userService'

function readCollection(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return parsed
  } catch {
    localStorage.setItem(key, JSON.stringify(seed))
    return seed
  }
}

function writeCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    throw new Error('Storage limit reached. Reduce uploaded file size and try again.')
  }
}

function appendAudit(entry) {
  const history = readCollection(UNIT_AUDIT_KEY, [])
  writeCollection(UNIT_AUDIT_KEY, [entry, ...history])
}

function toPropertyPrefix(name) {
  const chars = String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return (chars || 'UNT').slice(0, 3)
}

function toUnitNumber(propertyName, index) {
  return `${toPropertyPrefix(propertyName)}-${String(index + 1).padStart(3, '0')}`
}

function createUnitsForProperty(property, startIndex = 0, count = 0) {
  return Array.from({ length: count }, (_, offset) => {
    const absoluteIndex = startIndex + offset
    const isPg = String(property.type || '').toUpperCase() === 'PG'
    return {
      id: Date.now() + absoluteIndex + 1,
      propertyId: property.id,
      unitNo: toUnitNumber(property.name, absoluteIndex),
      property: property.name,
      propertyType: property.type || 'Apartment',
      owner: '',
      tenant: '',
      tenantProfiles: [],
      sharingCapacity: isPg ? 3 : 1,
      floor: Math.floor(absoluteIndex / 4) + 1,
      advancePayment: 0,
      status: 'AVAILABLE',
    }
  })
}

function withSeedLinks(properties, units) {
  if (!units.length) return units
  const byName = new Map(properties.map((item) => [item.name, item]))
  return units.map((unit) => {
    const propertyType = unit.propertyType ?? byName.get(unit.property)?.type ?? 'Apartment'
    const isPg = String(propertyType).toUpperCase() === 'PG'
    const tenantProfiles = Array.isArray(unit.tenantProfiles)
      ? unit.tenantProfiles
      : unit.tenantProfile
      ? [unit.tenantProfile]
      : []
    const sharingCapacity = Number(unit.sharingCapacity) > 0
      ? Number(unit.sharingCapacity)
      : (isPg ? 3 : 1)
    const tenantLabel = isPg
      ? tenantProfiles.map((item) => item?.fullName).filter(Boolean).join(', ')
      : (unit.tenant ?? tenantProfiles[0]?.fullName ?? '')
    const tenantCount = isPg ? tenantProfiles.length : (tenantLabel ? 1 : 0)
    const status = isPg
      ? (tenantCount >= sharingCapacity ? 'OCCUPIED' : 'AVAILABLE')
      : (tenantCount ? 'OCCUPIED' : 'AVAILABLE')

    return {
      ...unit,
      propertyId: unit.propertyId ?? byName.get(unit.property)?.id ?? null,
      propertyType,
      owner: unit.owner ?? '',
      tenant: tenantLabel,
      ownerProfile: unit.ownerProfile ?? null,
      tenantProfile: unit.tenantProfile ?? tenantProfiles[0] ?? null,
      tenantProfiles,
      sharingCapacity,
      status,
    }
  })
}

function dropLegacySeedRecords(properties, units) {
  const seededPropertyIds = new Set([1, 2, 3, 4])
  const cleanedProperties = properties.filter((item) => !seededPropertyIds.has(Number(item.id)))
  const removedIds = new Set(
    properties
      .filter((item) => seededPropertyIds.has(Number(item.id)))
      .map((item) => Number(item.id))
  )

  const cleanedUnits = units.filter((unit) => {
    const unitId = Number(unit.id)
    const propertyId = Number(unit.propertyId)
    if (seededPropertyIds.has(unitId)) return false
    if (removedIds.has(propertyId)) return false
    return true
  })

  return { cleanedProperties, cleanedUnits }
}

export const inventoryService = {
  getProperties() {
    const properties = readCollection(PROPERTIES_KEY, propertiesSeed)
    const units = readCollection(UNITS_KEY, unitsSeed)
    const { cleanedProperties, cleanedUnits } = dropLegacySeedRecords(properties, units)
    if (cleanedProperties.length !== properties.length) {
      writeCollection(PROPERTIES_KEY, cleanedProperties)
    }
    if (cleanedUnits.length !== units.length) {
      writeCollection(UNITS_KEY, cleanedUnits)
    }
    return cleanedProperties
  },

  getUnits() {
    const properties = this.getProperties()
    const units = readCollection(UNITS_KEY, unitsSeed)
    const linked = withSeedLinks(properties, units)
    writeCollection(UNITS_KEY, linked)
    return linked
  },

  saveProperty(formState, editingId = null) {
    const properties = this.getProperties()
    const units = this.getUnits()

    if (editingId) {
      const current = properties.find((item) => item.id === editingId)
      const nextProperties = properties.map((item) => (item.id === editingId ? { ...item, ...formState, id: editingId, units: item.units } : item))
      const nextUnits = units.map((unit) => (
        unit.propertyId === editingId
          ? { ...unit, property: formState.name, propertyType: formState.type }
          : unit
      ))
      writeCollection(PROPERTIES_KEY, nextProperties)
      writeCollection(UNITS_KEY, nextUnits)
      return current
    }

    const newProperty = {
      ...formState,
      units: Number(formState.units) || 0,
      id: Date.now(),
    }
    const generatedUnits = createUnitsForProperty(newProperty, 0, newProperty.units)
    const nextProperties = [...properties, newProperty]
    const nextUnits = [...units, ...generatedUnits]
    writeCollection(PROPERTIES_KEY, nextProperties)
    writeCollection(UNITS_KEY, nextUnits)
    return newProperty
  },

  deleteProperty(propertyId) {
    const properties = this.getProperties()
    const units = this.getUnits()
    const removingUnits = units.filter((unit) => unit.propertyId === propertyId)
    const nextProperties = properties.filter((item) => item.id !== propertyId)
    const nextUnits = units.filter((unit) => unit.propertyId !== propertyId)

    // Remove auto-created assignment users only if they are no longer referenced by any remaining unit.
    const removableEmails = new Set(
      removingUnits
        .flatMap((unit) => [unit.ownerProfile?.email, unit.tenantProfile?.email, ...(unit.tenantProfiles || []).map((item) => item?.email)])
        .filter(Boolean)
        .map((email) => String(email).toLowerCase())
    )
    const retainedEmails = new Set(
      nextUnits
        .flatMap((unit) => [unit.ownerProfile?.email, unit.tenantProfile?.email, ...(unit.tenantProfiles || []).map((item) => item?.email)])
        .filter(Boolean)
        .map((email) => String(email).toLowerCase())
    )
    const users = userService.listUsers()
    users.forEach((entry) => {
      const email = String(entry.email || '').toLowerCase()
      if (!email) return
      if (!removableEmails.has(email) || retainedEmails.has(email)) return
      if (entry.source === 'UNIT_ASSIGNMENT') {
        userService.removeUser(entry.id)
      }
    })

    writeCollection(PROPERTIES_KEY, nextProperties)
    writeCollection(UNITS_KEY, nextUnits)
  },

  allocateUnit(unitId, allocationType, assigneeInput, meta = {}) {
    const units = this.getUnits()
    const assignee = typeof assigneeInput === 'string'
      ? { fullName: String(assigneeInput || '').trim() }
      : {
          fullName: String(assigneeInput?.fullName || '').trim(),
          email: String(assigneeInput?.email || '').trim().toLowerCase(),
          age: Number(assigneeInput?.age) || null,
          mobile: String(assigneeInput?.mobile || '').trim(),
          documentType: String(assigneeInput?.documentType || '').trim(),
          documentNumber: String(assigneeInput?.documentNumber || '').trim(),
          photo: assigneeInput?.photo || '',
          documentFile: assigneeInput?.documentFile || '',
        }
    const nextUnits = units.map((unit) => {
      if (unit.id !== unitId) return unit
      const isPgUnit = String(unit.propertyType || '').toUpperCase() === 'PG'
      if (allocationType === 'TENANT') {
        if (isPgUnit) {
          const existingProfiles = Array.isArray(unit.tenantProfiles)
            ? unit.tenantProfiles
            : unit.tenantProfile
            ? [unit.tenantProfile]
            : []
          const sharingCapacity = Math.max(
            1,
            Number(assigneeInput?.sharingCapacity) || Number(unit.sharingCapacity) || 3
          )
          const email = String(assignee.email || '').toLowerCase()
          if (email && existingProfiles.some((item) => String(item?.email || '').toLowerCase() === email)) {
            throw new Error('Tenant already added to this PG unit.')
          }
          if (existingProfiles.length >= sharingCapacity) {
            throw new Error(`Sharing limit reached for this unit (${sharingCapacity}).`)
          }
          const nextProfiles = [...existingProfiles, assignee]
          return {
            ...unit,
            sharingCapacity,
            tenantProfiles: nextProfiles,
            tenantProfile: nextProfiles[nextProfiles.length - 1] || null,
            tenant: nextProfiles.map((item) => item.fullName).join(', '),
            status: nextProfiles.length >= sharingCapacity ? 'OCCUPIED' : 'AVAILABLE',
          }
        }
        return {
          ...unit,
          tenant: assignee.fullName,
          tenantProfiles: [assignee],
          tenantProfile: assignee,
          status: assignee.fullName ? 'OCCUPIED' : 'AVAILABLE',
        }
      }
      return {
        ...unit,
        owner: assignee.fullName,
        ownerProfile: assignee,
      }
    })
    writeCollection(UNITS_KEY, nextUnits)
    appendAudit({
      id: Date.now(),
      unitId,
      unitNo: nextUnits.find((entry) => entry.id === unitId)?.unitNo || '',
      property: nextUnits.find((entry) => entry.id === unitId)?.property || '',
      allocationType,
      assigneeName: assignee.fullName,
      assigneeEmail: assignee.email || '',
      assignedByUserId: meta.assignedByUserId || null,
      assignedByName: meta.assignedByName || '',
      assignedByEmail: meta.assignedByEmail || '',
      createdAt: new Date().toISOString(),
    })
  },

  updateSharingCapacity(unitId, nextCapacity) {
    const units = this.getUnits()
    const parsedCapacity = Math.max(1, Number(nextCapacity) || 1)
    const nextUnits = units.map((unit) => {
      if (unit.id !== unitId) return unit
      const isPgUnit = String(unit.propertyType || '').toUpperCase() === 'PG'
      if (!isPgUnit) return unit
      const tenantProfiles = Array.isArray(unit.tenantProfiles) ? unit.tenantProfiles : []
      if (tenantProfiles.length > parsedCapacity) {
        throw new Error(`Capacity cannot be less than assigned tenants (${tenantProfiles.length}).`)
      }
      return {
        ...unit,
        sharingCapacity: parsedCapacity,
        status: tenantProfiles.length >= parsedCapacity ? 'OCCUPIED' : 'AVAILABLE',
      }
    })
    writeCollection(UNITS_KEY, nextUnits)
    return nextUnits.find((unit) => unit.id === unitId) || null
  },

  removeTenantFromUnit(unitId, tenantEmail, meta = {}) {
    const units = this.getUnits()
    const target = units.find((unit) => unit.id === unitId)
    if (!target) throw new Error('Unit not found')

    const emailKey = String(tenantEmail || '').trim().toLowerCase()
    if (!emailKey) throw new Error('Tenant email is required')

    const isPgUnit = String(target.propertyType || '').toUpperCase() === 'PG'
    if (!isPgUnit) {
      if (String(target.tenantProfile?.email || '').toLowerCase() !== emailKey) {
        throw new Error('Tenant not found in this unit')
      }
    }

    const nextUnits = units.map((unit) => {
      if (unit.id !== unitId) return unit
      if (isPgUnit) {
        const existing = Array.isArray(unit.tenantProfiles) ? unit.tenantProfiles : []
        const remaining = existing.filter((item) => String(item?.email || '').toLowerCase() !== emailKey)
        if (remaining.length === existing.length) {
          throw new Error('Tenant not found in this PG unit')
        }
        const capacity = Math.max(1, Number(unit.sharingCapacity) || 3)
        return {
          ...unit,
          tenantProfiles: remaining,
          tenantProfile: remaining[0] || null,
          tenant: remaining.map((item) => item.fullName).join(', '),
          status: remaining.length >= capacity ? 'OCCUPIED' : 'AVAILABLE',
        }
      }
      return {
        ...unit,
        tenant: '',
        tenantProfiles: [],
        tenantProfile: null,
        status: 'AVAILABLE',
      }
    })
    writeCollection(UNITS_KEY, nextUnits)

    const remainingEmails = new Set(
      nextUnits
        .flatMap((unit) => [unit.ownerProfile?.email, unit.tenantProfile?.email, ...(unit.tenantProfiles || []).map((item) => item?.email)])
        .filter(Boolean)
        .map((email) => String(email).toLowerCase())
    )
    const targetUser = userService.findByEmail(emailKey)
    if (targetUser?.source === 'UNIT_ASSIGNMENT' && !remainingEmails.has(emailKey)) {
      userService.removeUser(targetUser.id)
    }

    appendAudit({
      id: Date.now(),
      unitId,
      unitNo: target.unitNo || '',
      property: target.property || '',
      allocationType: 'TENANT_REMOVED',
      assigneeName: target.tenant || '',
      assigneeEmail: tenantEmail || '',
      assignedByUserId: meta.assignedByUserId || null,
      assignedByName: meta.assignedByName || '',
      assignedByEmail: meta.assignedByEmail || '',
      createdAt: new Date().toISOString(),
    })
  },

  getUnitAudit(unitId = null) {
    const history = readCollection(UNIT_AUDIT_KEY, [])
    if (!unitId) return history
    return history.filter((entry) => entry.unitId === unitId)
  },
}
