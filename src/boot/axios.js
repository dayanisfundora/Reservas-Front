import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import { clearStoredSession, getStoredSession } from 'src/assets/js/util/authStorage'

const api = axios.create({ baseURL: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api' })
let sessionExpiredLock = false

/**
 * Allow API calls again after a successful login.
 */
function clearUnauthorizedLock() {
  sessionExpiredLock = false
}

function applyDefaultHeaders() {
  const session = getStoredSession()
  if (session?.token) api.defaults.headers.common.Authorization = `Bearer ${session.token}`
  if (session?.empresaActivaId) api.defaults.headers.common['X-Empresa-Id'] = session.empresaActivaId
}

function expireSession() {
  if (sessionExpiredLock || !getStoredSession()?.token) return
  sessionExpiredLock = true
  clearStoredSession()
  delete api.defaults.headers.common.Authorization
  delete api.defaults.headers.common['X-Empresa-Id']
  Notify.create({ type: 'warning', message: 'La sesión expiró. Inicia sesión nuevamente.' })
  if (window.location.pathname !== '/login') window.location.href = '/login'
}

applyDefaultHeaders()

api.interceptors.request.use((config) => {
  if (sessionExpiredLock && !config.skipAuthRedirect) {
    return Promise.reject(new axios.Cancel('session-expired'))
  }

  const session = getStoredSession()
  config.headers = config.headers || {}

  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
  if (!config.skipEmpresaHeader && session?.empresaActivaId) config.headers['X-Empresa-Id'] = session.empresaActivaId

  const method = (config.method || 'get').toLowerCase()
  const url = config.url || ''
  const exemptScope = /(casas|empresas|auth)\b/.test(url)
  if (method === 'get' && !config.skipScopeParams && !exemptScope && session?.casaActivaId) {
    config.params = { ...(config.params || {}) }
    if (config.params.casa_id === undefined) config.params.casa_id = session.casaActivaId
  }

  if (config.data instanceof FormData) delete config.headers['Content-Type']

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 && !error.config?.skipAuthRedirect) expireSession()
    else if (status === 403) Notify.create({ type: 'negative', message: error.response?.data?.message || 'No tiene permiso para realizar esta acción.' })
    else if (status >= 500 && error.config?.showGenericError !== false) Notify.create({ type: 'negative', message: 'Error interno del servidor.' })
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, applyDefaultHeaders, clearUnauthorizedLock }
