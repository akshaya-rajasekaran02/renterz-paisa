import api from './api'
import { complaintSeed } from './mockData'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Converts backend complaint DTO to the frontend list shape.
 */
function toComplaintItem(item) {
  return {
    id: item.complaintId,
    unitId: item.unitId,
    title: item.title,
    description: item.description,
    status: item.status,
    createdByUserId: item.userId ?? null,
    createdByName: item.userName || 'User',
    createdByRole: item.userRole || 'TENANT',
    createdAt: item.createdAt,
  }
}

export const complaintService = {
  /**
   * Fetches complaints visible to a tenant account.
   */
  async listTenantComplaints() {
    try {
      const { data } = await api.get('/api/tenant/complaints')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toComplaintItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return complaintSeed
    }
  },

  /**
   * Creates a new complaint from the tenant side.
   */
  async createTenantComplaint(payload) {
    const request = {
      unitId: Number(payload.unitId),
      title: String(payload.title || '').trim(),
      description: String(payload.description || '').trim(),
    }
    const { data } = await api.post('/api/tenant/complaints', request)
    return toComplaintItem(data)
  },

  /**
   * Fetches complaints visible to an owner account.
   */
  async listOwnerComplaints() {
    try {
      const { data } = await api.get('/api/owner/complaints')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toComplaintItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return complaintSeed
    }
  },

  /**
   * Updates owner-managed complaint workflow status.
   */
  async updateOwnerComplaintStatus(complaintId, status) {
    const { data } = await api.put(`/api/owner/complaints/${complaintId}/status`, null, {
      params: { status },
    })
    return toComplaintItem(data)
  },
}
