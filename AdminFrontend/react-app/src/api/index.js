// ============================================================
// Central API Client - Axios instance
// ============================================================
import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 — try refresh token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          || sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })

        // Save new tokens
        const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
          ? localStorage : sessionStorage
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token)
        if (data.refreshToken) {
          storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — logout
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        sessionStorage.removeItem(STORAGE_KEYS.USER)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
