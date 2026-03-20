// ============================================================
// JWT Utilities - Decode & validate tokens
// ============================================================

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Decode JWT payload (no verification — trust backend token)
 */
export function decodeToken(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (payload.length % 4) payload += '='
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

/** Check token expired */
export function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

/** Check token expiring within 5 minutes */
export function isTokenExpiringSoon(token) {
  if (!token) return true
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return (payload.exp * 1000 - Date.now()) <= REFRESH_THRESHOLD_MS
}

/** Get token expiration date */
export function getTokenExpiry(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return null
  return new Date(payload.exp * 1000)
}

/** Get user role from token payload */
export function getRoleFromToken(token) {
  const payload = decodeToken(token)
  return payload?.role || payload?.Role || payload?.roleName || null
}
