import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth-store'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useProyectoStore } from 'src/stores/proyecto-store'

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory(process.env.VUE_ROUTER_BASE) : createWebHashHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const empresa = useEmpresaStore()
    auth.hydrateFromStorage()

    if (to.meta.requiresGuest && auth.isAuthenticated) {
      if (!empresa.empresaActivaId) return { name: 'SelectEmpresa' }
      return { name: auth.firstAccessibleRouteName() }
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    if (to.meta.requiresAuth && auth.isAuthenticated) {
      try {
        await auth.ensureEmpresaContext()
      } catch (error) {
        if (error?.response?.status === 401 || !auth.isAuthenticated) {
          return { name: 'Login', query: { redirect: to.fullPath } }
        }
        console.error('No se pudo cargar el contexto de empresa', error)
      }
      if (!to.meta.skipEmpresaRequired && !empresa.empresaActivaId) return { name: 'SelectEmpresa' }
      if (to.meta.permissions && !auth.hasAllPermissions(to.meta.permissions)) return { name: 'Unauthorized' }
    }
  })

  Router.afterEach(() => {
    const auth = useAuthStore()
    if (auth.isAuthenticated) return
    const empresa = useEmpresaStore()
    const proyecto = useProyectoStore()
    if (empresa.empresas.length || empresa.empresaActivaId) empresa.clear()
    if (proyecto.initialized || proyecto.casaActivaId) proyecto.clearContext()
  })

  return Router
})
