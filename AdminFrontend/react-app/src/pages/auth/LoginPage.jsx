import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import authApi from '../../api/authApi'
import { ROLES } from '../../utils/constants'
import '../../assets/css/login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || null

  const getErrorMessage = (err) => {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.response?.data || ''
    if (status === 401) return 'Tên đăng nhập hoặc mật khẩu không đúng.'
    if (status === 403) return 'Tài khoản đã bị khóa.'
    if (status === 400 && msg.includes('locked')) return 'Tài khoản đã bị khóa do nhập sai nhiều lần.'
    if (msg && typeof msg === 'string') return msg
    return 'Đăng nhập thất bại. Vui lòng thử lại.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) return setError('Vui lòng nhập tên đăng nhập.')
    if (!password) return setError('Vui lòng nhập mật khẩu.')

    setLoading(true)
    try {
      const res = await authApi.login({ username: username.trim(), password })
      const { token, refreshToken, user } = res.data
      login(user, token, refreshToken, rememberMe)

      if (from) {
        navigate(from, { replace: true })
        return
      }

      switch (user.role) {
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
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <img src="/logo.png" alt="Logo" onError={(e) => { e.target.style.display = 'none' }} />
            <h2>Quản lý Điểm danh Sinh viên</h2>
          </div>

          <h3 className="login-title">Đăng nhập</h3>

          {location.state?.resetSuccess && (
            <div className="alert alert-success mb-3">
              Đặt lại mật khẩu thành công. Vui lòng đăng nhập.
            </div>
          )}

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '0 4px',
                  }}
                >
                  <i className={`fa fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe" style={{ margin: 0, fontSize: '14px', cursor: 'pointer' }}>
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <span><i className="fa fa-spinner fa-spin"></i> Đang đăng nhập...</span>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="/auth/forgot-password">Quên mật khẩu?</a>
          </div>
        </div>
      </div>
    </div>
  )
}
