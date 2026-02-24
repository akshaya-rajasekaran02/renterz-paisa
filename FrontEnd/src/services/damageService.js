import api from './api'
import { damageReportsSeed } from './mockData'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Maps backend damage DTO into the damage card shape used by the page.
 */
function toDamageItem(item) {
  return {
    id: item.damageId,
    unitId: item.unitId,
    unit: item.unitNumber || '',
    tenantName: item.tenantName || 'Tenant',
    tenantEmail: item.tenantEmail || '',
    description: item.description || '',
    startImages: item.beforeImage ? [item.beforeImage] : [],
    endImages: item.afterImage ? [item.afterImage] : [],
    estimatedCost: Number(item.estimatedCost || 0) || null,
    status: item.status || 'OPEN',
    paymentAdded: Boolean(item.billed),
    createdAt: item.createdAt,
    property: '',
    floor: '',
    aiAssessment: null,
  }
}

export const damageService = {
  /**
   * Loads damage records for owner views.
   */
  async listOwnerDamages() {
    try {
      const { data } = await api.get('/api/owner/damages')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toDamageItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return damageReportsSeed
    }
  },

  /**
   * Loads damage records for tenant views.
   */
  async listTenantDamages() {
    try {
      const { data } = await api.get('/api/tenant/damages')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toDamageItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return damageReportsSeed
    }
  },

  /**
   * Creates a damage bill from owner side.
   */
  async createOwnerDamage(payload) {
    const request = {
      unitId: Number(payload.unitId),
      userId: Number(payload.userId),
      description: String(payload.description || '').trim() || 'Damage reported',
      beforeImage: payload.beforeImage || '',
      afterImage: payload.afterImage || '',
      estimatedCost: Number(payload.estimatedCost || 0),
    }
    const { data } = await api.post('/api/owner/damages', request)
    return toDamageItem(data)
  },
}
