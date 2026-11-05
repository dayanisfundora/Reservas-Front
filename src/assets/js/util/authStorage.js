const KEY = 'reservas_auth_session'
/** Minutos de vida de la sesión (alineado con Sanctum). */
export const SESSION_MINUTES = 15

/**
 * sessionStorage: al cerrar el navegador / la ventana del sistema se pierde la sesión.
 * localStorage se limpia por si quedó una sesión antigua sin caducidad.
 */
function storage() {
  return window.sessionStorage
}

function purgeLegacyLocalStorage() {
  try {
    window.localStorage.removeItem(KEY)
  } catch (_error) {
    // ignore
  }
}

function isExpired(session) {
  const expiresAt = Number(session?.expiresAt)
  return Number.isFinite(expiresAt) && expiresAt > 0 && Date.now() > expiresAt
}

export function getStoredSession() {
  purgeLegacyLocalStorage()
  try {
    const raw = storage().getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.token || isExpired(session)) {
      clearStoredSession()
      return null
    }
    return session
  } catch (_error) {
    clearStoredSession()
    return null
  }
}

export function setStoredSession(session) {
  purgeLegacyLocalStorage()
  const next = { ...(session || {}) }
  if (next.token && !next.expiresAt) {
    next.expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000
  }
  if (!next.token || isExpired(next)) {
    clearStoredSession()
    return
  }
  storage().setItem(KEY, JSON.stringify(next))
}

export function clearStoredSession() {
  try {
    storage().removeItem(KEY)
  } catch (_error) {
    // ignore
  }
  purgeLegacyLocalStorage()
}
