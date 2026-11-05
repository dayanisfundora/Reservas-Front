import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api, applyDefaultHeaders, clearUnauthorizedLock } from 'src/boot/axios'
import { clearStoredSession, getStoredSession, SESSION_MINUTES, setStoredSession } from 'src/assets/js/util/authStorage'
import { useEmpresaStore } from './empresa-store'
import { useProyectoStore } from './proyecto-store'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, user: null, permissions: [], initialized: false }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    userName: (state) => state.user?.name || '',
    userRoles: (state) => (state.user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name)).filter(Boolean),
  },
  actions: {
    hydrateFromStorage() {
      if (this.initialized) return
      const session = getStoredSession()
      if (session?.token) {
        this.token = session.token
        this.user = session.user || null
        this.permissions = session.permissions || []
        const empresaStore = useEmpresaStore()
        const proyectoStore = useProyectoStore()
        empresaStore.hydrate(session)
        proyectoStore.hydrate(session)
      } else {
        this.token = null
        this.user = null
        this.permissions = []
      }
      this.initialized = true
    },
    persistSession(extra = {}) {
      if (!this.token) {
        clearStoredSession()
        applyDefaultHeaders()
        return
      }
      const empresaStore = useEmpresaStore()
      const proyectoStore = useProyectoStore()
      const previous = getStoredSession()
      setStoredSession({
        token: this.token,
        user: this.user,
        permissions: this.permissions,
        empresas: empresaStore.empresas,
        empresaActivaId: empresaStore.empresaActivaId,
        casaActivaId: proyectoStore.casaActivaId,
        expiresAt: previous?.expiresAt || (Date.now() + SESSION_MINUTES * 60 * 1000),
        ...extra,
      })
      applyDefaultHeaders()
    },
    async login(credentials) {
      clearUnauthorizedLock()
      const { data } = await api.post('/auth/login', credentials, { skipAuthRedirect: true, skipEmpresaHeader: true })
      const payload = data.data
      this.token = payload.token
      this.user = payload.user
      this.permissions = payload.permissions || []
      const empresaStore = useEmpresaStore()
      const proyectoStore = useProyectoStore()
      empresaStore.setEmpresas(payload.empresas || [])
      empresaStore.syncEmpresaActivaFromList()
      proyectoStore.clearContext()
      this.persistSession({ expiresAt: Date.now() + SESSION_MINUTES * 60 * 1000 })
      return payload
    },
    async fetchCurrentUser() {
      const { data } = await api.get('/auth/me')
      const payload = data.data
      this.user = payload.user
      this.permissions = payload.permissions || []
      useEmpresaStore().setEmpresas(payload.empresas || [])
      this.persistSession()
      return payload
    },
    async updateProfile(payload) {
      const { data } = await api.put('/auth/profile', payload, { skipEmpresaHeader: true })
      this.user = data.data.user
      this.permissions = data.data.permissions || this.permissions
      this.persistSession()
      return data
    },
    async ensureEmpresaContext() {
      this.hydrateFromStorage()
      const empresaStore = useEmpresaStore()
      const proyectoStore = useProyectoStore()
      if (!this.user || !empresaStore.empresas.length) await this.fetchCurrentUser()
      if (empresaStore.empresaActivaId && !proyectoStore.initialized) await proyectoStore.refreshCatalog()
    },
    /**
     * Revoke the token and drop the credentials. The empresa/casa context is cleared by the
     * router after leaving the protected page, so its watchers don't fire unauthenticated requests.
     */
    async logout() {
      try { await api.post('/auth/logout', null, { skipEmpresaHeader: true, skipAuthRedirect: true }) } catch (_e) {}
      this.clearCredentials()
      Notify.create({ type: 'positive', message: 'Has cerrado sesión correctamente.', position: 'top-right' })
    },
    clearCredentials() {
      this.token = null
      this.user = null
      this.permissions = []
      clearStoredSession()
      delete api.defaults.headers.common.Authorization
      delete api.defaults.headers.common['X-Empresa-Id']
    },
    clearSession() {
      this.clearCredentials()
      useEmpresaStore().clear()
      useProyectoStore().clearContext()
    },
    hasPermission(permission) { return this.permissions.includes(permission) },
    hasAnyPermission(list = []) { return list.some((p) => this.hasPermission(p)) },
    hasAllPermissions(list = []) { return list.every((p) => this.hasPermission(p)) },
    hasRole(role) { return this.userRoles.includes(role) },
    firstAccessibleRouteName() {
      if (this.hasPermission('ver_reservas')) return 'CalendarioReservas'
      if (this.hasPermission('gestionar_habitaciones')) return 'GestionHabitaciones'
      if (this.hasPermission('gestionar_casas')) return 'GestionCasas'
      return 'Unauthorized'
    },
  },
})
