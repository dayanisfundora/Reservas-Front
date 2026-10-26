const KEY = 'reservas_auth_session'

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_error) {
    localStorage.removeItem(KEY)
    return null
  }
}

export function setStoredSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session || {}))
}

export function clearStoredSession() {
  localStorage.removeItem(KEY)
}
