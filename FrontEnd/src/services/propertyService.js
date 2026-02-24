import api from './api'
import { inventoryService } from './inventoryService'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Converts frontend property type labels to backend enum values.
 */
function toBackendPropertyType(type) {
  const value = String(type || '').trim().toUpperCase()
  if (value === 'APARTMENT') return 'APARTMENT'
  if (value === 'BUILDING') return 'BUILDING'
  return 'PG'
}

/**
 * Converts backend property DTO to the card/list shape used by pages.
 */
function toFrontendProperty(item) {
  const type = String(item.propertyType || '').toUpperCase()
  return {
    id: item.propertyId,
    name: item.propertyName,
    city: item.city,
    type: type === 'APARTMENT' ? 'Apartment' : type === 'BUILDING' ? 'Building' : 'PG',
    status: item.status,
    address: item.address || '',
    units: Number(item.units || 0),
  }
}

/**
 * Converts backend unit DTO to frontend unit shape.
 */
function toFrontendUnit(item) {
  return {
    id: item.unitId,
    propertyId: item.propertyId,
    unitNo: item.unitNumber || '',
    property: item.propertyName || item.property?.propertyName || '',
    propertyType: item.propertyType || item.property?.propertyType || 'Apartment',
    owner: item.ownerName || item.owner?.name || item.ownerName || '',
    ownerProfile: item.owner || { userId: item.ownerId, name: item.ownerName },
    tenant: '',
    tenantProfiles: [],
    floor: item.floor || 1,
    monthlyRent: item.monthlyRent || 0,
    status: item.status || 'AVAILABLE',
  }
}

export const propertyService = {
  /**
   * Loads properties from backend for admin views.
   */
  async listProperties() {
    try {
      const { data } = await api.get('/api/admin/properties')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toFrontendProperty)
    } catch (error) {
      if (!useDemoAuth) throw error
      return inventoryService.getProperties()
    }
  },

  /**
   * Loads a single property by id.
   */
  async getProperty(id) {
    try {
      const { data } = await api.get(`/api/admin/properties/${id}`)
      return toFrontendProperty(data)
    } catch (error) {
      if (!useDemoAuth) throw error
      return inventoryService.getProperties().find((item) => Number(item.id) === Number(id)) || null
    }
  },

  /**
   * Creates a new property in backend.
   */
  async createProperty(payload, adminId) {
    const request = {
      propertyName: String(payload.name || '').trim(),
      propertyType: toBackendPropertyType(payload.type),
      city: String(payload.city || '').trim(),
      address: String(payload.address || payload.city || '').trim(),
      units: Number(payload.units) || 0,
    }
    const { data } = await api.post('/api/admin/properties', request, {
      params: { adminId },
    })
    return toFrontendProperty(data)
  },

  /**
   * Updates an existing property in backend.
   */
  async updateProperty(id, payload) {
    const request = {
      propertyName: String(payload.name || '').trim(),
      propertyType: toBackendPropertyType(payload.type),
      city: String(payload.city || '').trim(),
      address: String(payload.address || payload.city || '').trim(),
      units: Number(payload.units) || 0,
    }
    const { data } = await api.put(`/api/admin/properties/${id}`, request)
    return toFrontendProperty(data)
  },

  /**
   * Deletes a property in backend.
   */
  async deleteProperty(id) {
    await api.delete(`/api/admin/properties/${id}`)
  },

  /**
   * Fetches all units from backend.
   */
  async getAllUnits() {
    try {
      const { data } = await api.get('/api/admin/properties/units/all')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toFrontendUnit)
    } catch (error) {
      if (!useDemoAuth) throw error
      return inventoryService.getUnits()
    }
  },
}
