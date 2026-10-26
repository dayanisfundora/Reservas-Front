import { defineStore } from 'pinia'
import { api, applyDefaultHeaders } from 'src/boot/axios'

export const useEmpresaStore = defineStore('empresa', {
  state: () => ({ empresas: [], empresaActivaId: null, initialized: false }),
  getters: {
    empresaActiva: (state) => state.empresas.find((e) => Number(e.id) === Number(state.empresaActivaId)) || null,
    hasEmpresaActiva: (state) => Boolean(state.empresaActivaId),
    hasMultipleEmpresas: (state) => state.empresas.length > 1,
  },
  actions: {
    hydrate(session) {
      this.empresas = session.empresas || []
      this.empresaActivaId = session.empresaActivaId || null
      this.initialized = true
      applyDefaultHeaders()
    },
    setEmpresas(empresas) { this.empresas = empresas || []; this.initialized = true },
    syncEmpresaActivaFromList() {
      if (this.empresaActivaId && this.empresas.some((e) => Number(e.id) === Number(this.empresaActivaId))) return
      this.empresaActivaId = this.empresas.length === 1 ? this.empresas[0].id : null
    },
    setEmpresaActiva(id) { this.empresaActivaId = id ? Number(id) : null; applyDefaultHeaders() },
    async refreshEmpresas() { const { data } = await api.get('/empresas', { skipEmpresaHeader: true }); this.setEmpresas(data.data || []); this.syncEmpresaActivaFromList() },
    clear() { this.empresas = []; this.empresaActivaId = null; this.initialized = false },
  },
})
