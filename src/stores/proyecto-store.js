import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { getStoredSession, setStoredSession } from 'src/assets/js/util/authStorage'

function toCasaId(value) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export const useProyectoStore = defineStore('proyecto', {
  state: () => ({ casas: [], casaActivaId: null, initialized: false }),
  getters: {
    casaActiva: (state) => state.casas.find((c) => Number(c.id) === Number(state.casaActivaId)) || null,
    scopeQueryParams: (state) => (state.casaActivaId ? { casa_id: state.casaActivaId } : {}),
  },
  actions: {
    hydrate(session) { this.casaActivaId = toCasaId(session.casaActivaId); this.initialized = false },
    persistContext() { const session = getStoredSession() || {}; setStoredSession({ ...session, casaActivaId: this.casaActivaId }) },
    async refreshCatalog() {
      const { data } = await api.get('/casas', { skipScopeParams: true })
      this.casas = (data.data || []).map((c) => ({ ...c, id: Number(c.id), label: c.nombre, value: Number(c.id) }))
      if (this.casaActivaId && !this.casas.some((c) => Number(c.id) === Number(this.casaActivaId))) this.casaActivaId = null
      if (!this.casaActivaId && this.casas.length === 1) this.casaActivaId = this.casas[0].id
      this.initialized = true
      this.persistContext()
    },
    setCasaActiva(id) { this.casaActivaId = toCasaId(id); this.persistContext() },
    clearContext() { this.casas = []; this.casaActivaId = null; this.initialized = false; this.persistContext() },
  },
})
