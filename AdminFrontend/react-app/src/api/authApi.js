import apiClient from './index'
const BASE = '/auth'
const authApi = {
  login: (credentials) => apiClient.post(`${BASE}/login`, credentials),
  logout: () => apiClient.post(`${BASE}/logout`),
  refreshToken: (refreshToken) => apiClient.post(`${BASE}/refresh-token`, { refreshToken }),
  forgotPassword: (data) => apiClient.post(`${BASE}/forgot-password`, data),
  verifyOTP: (data) => apiClient.post(`${BASE}/verify-otp`, data),
  resetPassword: (data) => apiClient.post(`${BASE}/reset-password`, data),
  getOTPRemainingTime: (email) => apiClient.get(`${BASE}/otp-remaining-time?email=${encodeURIComponent(email)}`),
}
export default authApi
