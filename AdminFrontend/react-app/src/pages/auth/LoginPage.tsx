import { useState } from 'react'
import { useNavigate, useLocation, type Location } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/constants'
import type { AuthUser, UserRole } from '../../types'
import '../../assets/css/login.css'

// ============================================================
// LOCAL TYPES
// ============================================================

interface LoginError {
  response?: {
    status?: number
    data?: unknown
  }
}

interface LoginPayload {
  token: string
  refreshToken?: string
  userId: string | number
  username: string
  role: UserRole
  fullName?: string
  avatarUrl?: string
}

interface LocationState {
  resetSuccess?: boolean
  from?: {
    pathname: string
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation() as Location<LocationState>
  const { login } = useAuth()

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const from = location.state?.from?.pathname ?? null

  const getErrorMessage = (err: LoginError): string => {
    const status = err.response?.status
    const msg = err.response?.data
    if (status === 401) return 'Tên đăng nhập hoặc mật khẩu không đúng.'
    if (status === 403) return 'Tài khoản đã bị khóa.'
    if (status === 400 && typeof msg === 'string' && msg.includes('locked')) {
      return 'Tài khoản đã bị khóa do nhập sai nhiều lần.'
    }
    if (msg && typeof msg === 'string') return msg
    return 'Đăng nhập thất bại. Vui lòng thử lại.'
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.')
      return
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.')
      return
    }

    setLoading(true)
    try {
      // Dùng fetch trực tiếp thay vì authApi.login để tránh lỗi axios
      const response = await fetch('/api-edu/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({})) as { message?: string }
        throw new Error(errData.message || `Lỗi ${response.status}`)
      }

      const res = await response.json() as unknown as { data?: LoginPayload } | LoginPayload
      // Backend trả về { data: { token, refreshToken, userId, username, role, fullName, avatarUrl } }
      let payload: LoginPayload
      if ('data' in res && res.data) {
        payload = res.data
      } else {
        payload = res as unknown as LoginPayload
      }
      const { token, refreshToken, userId, username: uname, role, fullName, avatarUrl } = payload

      if (!token || !userId) {
        throw new Error('Phản hồi từ server không hợp lệ.')
      }

      const userData: AuthUser = {
        userId,
        username: uname,
        email: '',
        fullName: fullName ?? '',
        role,
        avatarUrl,
      }

      login(userData, token, refreshToken ?? '', rememberMe)

      if (from) {
        navigate(from, { replace: true })
        return
      }

      switch (role) {
        case ROLES.ADMIN:
          navigate('/admin/dashboard', { replace: true })
          break
        case ROLES.ADVISOR:
          navigate('/advisor/dashboard', { replace: true })
          break
        case ROLES.LECTURER:
          navigate('/lecturer/dashboard', { replace: true })
          break
        case ROLES.STUDENT:
          navigate('/student/dashboard', { replace: true })
          break
        default:
          navigate('/', { replace: true })
      }
    } catch (err) {
      setError(getErrorMessage(err as LoginError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modern-login-page">
      <div className="login-background" />

      <div className="login-glass-container">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo-circle">
            <i className="fas fa-graduation-cap" />
          </div>
          <h1 className="login-brand-title">Quản lý Điểm danh</h1>
          <p className="login-brand-subtitle">Hệ thống quản lý sinh viên</p>
        </div>

        {/* Success message */}
        {location.state?.resetSuccess && (
          <div className="login-success-message">
            <i className="fas fa-check-circle" />
            <span>Đặt lại mật khẩu thành công. Vui lòng đăng nhập.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="login-error-message">
            <i className="fas fa-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-glass-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <i className="fas fa-user login-input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <i className="fas fa-lock login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input-with-toggle"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`} />
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="login-options">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Ghi nhớ đăng nhập</span>
            </label>

            <a href="/auth/forgot-password" className="login-link-accent">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit */}
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
                <i className="fas fa-sign-in-alt" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer-text">
          Hệ thống Quản lý Điểm danh Sinh viên © 2026
        </p>
      </div>
    </div>
  )
}
