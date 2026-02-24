import api from './api'
import { maintenanceSeed } from './mockData'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Maps backend maintenance DTO into frontend table shape.
 */
function toMaintenanceItem(item) {
  return {
    id: item.maintenanceId,
    unitId: item.unitId,
    unit: item.unitNumber || `Unit-${item.unitId}`,
    issue: item.title,
    dueDate: item.dueDate,
    status: item.status,
    paid: item.status === 'PAID',
    amount: Number(item.amount || 0),
    billMonth: String(item.dueDate || '').slice(0, 7),
  }
}

export const maintenanceService = {
  /**
   * Loads maintenance bills scoped to the current owner.
   */
  async listOwnerMaintenance() {
    try {
      const { data } = await api.get('/api/owner/maintenance')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toMaintenanceItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return maintenanceSeed
    }
  },

  /**
   * Creates a maintenance bill for an owner unit.
   */
  async createOwnerMaintenance(payload) {
    const request = {
      unitId: Number(payload.unitId),
      title: String(payload.issue || '').trim(),
      dueDate: payload.dueDate,
      amount: Number(payload.amount),
      status: payload.status || 'DUE',
    }
    const { data } = await api.post('/api/owner/maintenance', request)
    return toMaintenanceItem(data)
  },
}
