import api from './api'

const BUILDINGS_KEY = 'rp_buildings'
const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

function readLocalBuildings() {
  try {
    const raw = localStorage.getItem(BUILDINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalBuildings(records) {
  localStorage.setItem(BUILDINGS_KEY, JSON.stringify(records))
}

export const buildingService = {
  async listBuildings() {
    try {
      const { data } = await api.get('/super-admin/buildings')
      return Array.isArray(data) ? data : data?.items || []
    } catch (error) {
      if (!useDemoAuth) throw error
      return readLocalBuildings()
    }
  },

  async createBuilding(payload) {
    try {
      const { data } = await api.post('/super-admin/buildings', payload)
      return data
    } catch (error) {
      if (!useDemoAuth) throw error
      const current = readLocalBuildings()
      const dbName = String(payload.dbName || '')
        .trim()
        .toLowerCase()
      const next = {
        id: Date.now(),
        name: String(payload.name || '').trim(),
        dbName: dbName || `building_${Date.now()}`,
        dbUrl: String(payload.dbUrl || '').trim() || '',
        status: 'ACTIVE',
      }
      const updated = [next, ...current]
      writeLocalBuildings(updated)
      return next
    }
  },

  async setBuildingStatus(buildingId, status) {
    try {
      const { data } = await api.patch(`/super-admin/buildings/${buildingId}/status`, { status })
      return data
    } catch (error) {
      if (!useDemoAuth) throw error
      const updated = readLocalBuildings().map((item) => (
        Number(item.id) === Number(buildingId) ? { ...item, status } : item
      ))
      writeLocalBuildings(updated)
      return updated.find((item) => Number(item.id) === Number(buildingId))
    }
  },
}
