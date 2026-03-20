// ============================================================
// Auth API - Đăng nhập, đăng xuất, quên mật khẩu
// ============================================================
import apiClient from './index'

const BASE = '/auth'

export const authApi = {
  /**
   * Đăng nhập
   * @param {string} username
   * @param {string} password
   */
  login: (username, password) =>
    apiClient.post(`${BASE}/login`, { username, password }),

  /**
   * Đăng xuất
   * @param {string} refreshToken
   */
  logout: (refreshToken) =>
    apiClient.post(`${BASE}/logout`, { refreshToken }),

  /**
   * Làm mới token
   * @param {string} refreshToken
   */
  refreshToken: (refreshToken) =>
    apiClient.post(`${BASE}/refresh`, { refreshToken }),

  /**
   * Quên mật khẩu - gửi OTP
   * @param {string} email
   */
  forgotPassword: (email) =>
    apiClient.post(`${BASE}/forgot-password`, { email }),

  /**
   * Xác minh OTP
   * @param {string} email
   * @param {string} otp
   */
  verifyOTP: (email, otp) =>
    apiClient.post(`${BASE}/verify-otp`, { email, otp }),

  /**
   * Đặt lại mật khẩu (sau khi OTP đã được xác minh)
   * @param {string} email
   * @param {string} newPassword
   * @param {string} confirmPassword
   */
  resetPassword: (email, newPassword, confirmPassword) =>
    apiClient.post(`${BASE}/reset-password`, { email, newPassword, confirmPassword }),

  /**
   * Đổi mật khẩu (khi đã đăng nhập)
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: (currentPassword, newPassword) =>
    apiClient.post(`${BASE}/change-password`, { currentPassword, newPassword }),
}
