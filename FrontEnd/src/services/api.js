import axios from 'axios'
import { API_CONFIG, TOKEN_KEY } from '../constants/app'

let onUnauthorized = null

/**
 * Registers a callback that runs when the API returns HTTP 401.
 */
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

/**
 * Normalizes backend payloads by unwrapping `{ success, message, data }`.
 */
const unwrapApiResponse = (payload) => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data
  }
  return payload
}

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
})

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    response.data = unwrapApiResponse(response.data)
    return response
  },
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default api
