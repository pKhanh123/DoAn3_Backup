import axios from 'axios'
import { STORAGE_KEYS } from '../utils/constants'

const apiClient = axios.create({
  baseURL: '/api-edu',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          || sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (!refreshToken) { window.location.href = '/auth/login'; throw error }
        const res = await axios.post('/api-edu/auth/refresh-token', { refreshToken })
        const { token: newToken, refreshToken: newRefresh } = res.data
        const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) ? localStorage : sessionStorage
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken)
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefresh)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        ;['ACCESS_TOKEN','REFRESH_TOKEN','USER','REMEMBER_ME'].forEach(k => {
          localStorage.removeItem(STORAGE_KEYS[k])
          sessionStorage.removeItem(STORAGE_KEYS[k])
        })
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
