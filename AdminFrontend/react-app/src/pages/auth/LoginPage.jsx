// ============================================================
// LoginPage — Trang đăng nhập (React version)
// Chuyển đổi từ AngularJS LoginController.js
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/authApi'
import '../../assets/css/login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, getRedirectPath } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Ref for password wrapper (autofill detection)
  const wrapperRef = useRef(null)
  const passwordRef = useRef(null)

  // If already authenticated, redirect
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (isAuthenticated) navigate(getRedirectPath('Admin'), { replace: true })
  }, [isAuthenticated, navigate, getRedirectPath])

  // Autofill detection for password toggle visibility
  useEffect(() => {
    const checks = [100, 300, 500, 1000, 2000]
    const ensureVisible = () => {
      if (wrapperRef.current && passwordRef.current?.value) {
        wrapperRef.current.classList.add('autofilled')
      }
    }
    checks.forEach((d) => setTimeout(ensureVisible, d))
  }, [])

  const getErrorMessage = (err) => {
    if (!err) return null
    if (err?.response?.data?.message) return err.response.data.message
    if (err?.response?.status === 401) return 'Tên đăng nhập hoặc mật khẩu không đúng'
    if (err?.response?.status === 400) return 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
    if (err?.response?.status === 0) return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    if (err?.response?.status >= 500) return 'Lỗi hệ thống. Vui lòng thử lại sau.'
    if (err?.message) return err.message
    return 'Tên đăng nhập hoặc mật khẩu không đúng'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập')
      return
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setLoading(true)

    try {
      const { data } = await authApi.login(username, password)
      const loginData = data?.data || data

      // Save token & user
      await login(loginData, loginData.token, loginData.refreshToken, rememberMe)

      // Redirect based on role
      const role = loginData.Role || loginData.roleName || loginData.role || 'Admin'
      const redirectPath = getRedirectPath(role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <div className="modern-login-page">
      {/* Background */}
      <div className="login-background" />

      {/* Glass Container */}
      <div className="login-glass-container">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo-circle">
            <i className="fas fa-graduation-cap" />
          </div>
          <h1 className="login-brand-title">Hệ thống Điểm danh</h1>
          <p className="login-brand-subtitle">Quản lý Điểm danh Sinh viên</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error-message">
            <i className="fas fa-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-glass-form" onSubmit={handleLogin} noValidate>
          {/* Username */}
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <i className="fas fa-user login-input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-input-group">
            <div className="login-input-wrapper" ref={wrapperRef}>
              <i className="fas fa-lock login-input-icon" />
              <input
                id="login-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input-with-toggle"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="login-options">
            {/* Remember Me */}
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Ghi nhớ đăng nhập</span>
            </label>

            {/* Forgot Password */}
            <button
              type="button"
              className="login-link-primary"
              onClick={handleForgotPassword}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }} />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer-text">
          © 2024 Hệ thống Quản lý Điểm danh Sinh viên
        </p>
      </div>
    </div>
  )
}
