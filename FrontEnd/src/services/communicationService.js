import api from './api'
import { communicationSeed } from './mockData'

const useDemoAuth = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

/**
 * Maps backend communication DTO into the timeline card shape used by the UI.
 */
function toCommunicationItem(item) {
  return {
    id: item.communicationId,
    channel: item.channel,
    templateName: item.templateName,
    message: item.message,
    deliveryStatus: item.status,
    timestamp: item.createdAt,
  }
}

export const communicationService = {
  /**
   * Loads communications for the currently authenticated user.
   */
  async listMyCommunications() {
    try {
      const { data } = await api.get('/api/common/communications')
      const content = Array.isArray(data) ? data : data?.content || []
      return content.map(toCommunicationItem)
    } catch (error) {
      if (!useDemoAuth) throw error
      return communicationSeed
    }
  },
}
