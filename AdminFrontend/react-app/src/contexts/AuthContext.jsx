// ============================================================
// AuthContext — Quản lý trạng thái đăng nhập toàn app
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS, ROLE_REDIRECTS } from '../utils/constants'
import { authApi } from '../api/authApi'
import { decodeToken, isTokenExpired } from '../utils/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const logoutRef = useRef(null)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      || sessionStorage.getItem(STORAGE_KEYS.USER)

    if (token && savedUser) {
      if (isTokenExpired(token)) {
        _doLogout(false)
      } else {
        try {
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        } catch {
          _doLogout(false)
        }
      }
    }
    setLoading(false)
  }, [])

  const _doLogout = useCallback(async (callApi = true) => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      || sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.USER)

    setUser(null)
    setIsAuthenticated(false)

    // Revoke refresh token on server (non-blocking)
    if (callApi && refreshToken) {
      authApi.logout(refreshToken).catch(() => {})
    }
  }, [])

  // Expose logout to outside (e.g. expired token interceptor)
  logoutRef.current = _doLogout

  const login = useCallback(async (userData, token, refreshToken, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    if (refreshToken) storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    if (rememberMe) localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => _doLogout(true), [_doLogout])

  const updateUser = useCallback((userData) => {
    const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
      ? localStorage : sessionStorage
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const getRedirectPath = useCallback((role) => {
    return ROLE_REDIRECTS[role] || '/admin/dashboard'
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white', fontFamily: 'Inter, sans-serif', fontSize: '16px'
      }}>
        Đang tải...
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
