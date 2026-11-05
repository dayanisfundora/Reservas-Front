import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useAuthStore } from './auth-store'
import { useProyectoStore } from './proyecto-store'

const STORAGE_PREFIX = 'reservas-notif-dismissed'
const POLL_MS = 60_000
const BRIEF_HOURS = 2
const LATE_WITHOUT_TIME_HOUR = 14

function todayIso(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function addDaysIso(iso, days) {
    const [y, m, d] = String(iso).split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + days)
    return todayIso(date)
}

function normalizeHora(hora) {
    if (!hora) return null
    const text = String(hora).slice(0, 5)
    return /^\d{2}:\d{2}$/.test(text) ? text : null
}

function arrivalDateTime(fechaIso, hora) {
    const [y, m, d] = String(fechaIso).split('-').map(Number)
    const hhmm = normalizeHora(hora)
    const [hh, mm] = hhmm ? hhmm.split(':').map(Number) : [0, 0]
    return new Date(y, m - 1, d, hh, mm, 0, 0)
}

function dismissKey(userId, casaId) {
    return `${STORAGE_PREFIX}:${userId || 'anon'}:${casaId || 'none'}`
}

function readDismissed(userId, casaId) {
    try {
        const raw = window.localStorage.getItem(dismissKey(userId, casaId))
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {}
    }
}

function writeDismissed(userId, casaId, map) {
    window.localStorage.setItem(dismissKey(userId, casaId), JSON.stringify(map))
}

function urgencyFor(item, now = new Date()) {
    const hoy = todayIso(now)
    const manana = addDaysIso(hoy, 1)
    const fecha = String(item.fecha_entrada || '').slice(0, 10)
    const hora = normalizeHora(item.hora_llegada)
    const arrival = arrivalDateTime(fecha, hora || '00:00')

    if (fecha === hoy) {
        if (hora) {
            if (arrival.getTime() < now.getTime()) return 'vencida'
            const msLeft = arrival.getTime() - now.getTime()
            if (msLeft <= BRIEF_HOURS * 60 * 60 * 1000) return 'en_breve'
            return 'hoy'
        }
        if (now.getHours() >= LATE_WITHOUT_TIME_HOUR) return 'vencida'
        return 'hoy'
    }

    if (fecha === manana) return 'manana'
    return 'hoy'
}

const URGENCY_ORDER = { vencida: 0, en_breve: 1, hoy: 2, manana: 3 }

export const useNotificacionesStore = defineStore('notificaciones', {
    state: () => ({
        items: [],
        dismissed: {},
        drawerOpen: false,
        loading: false,
        lastError: null,
        pollTimer: null,
    }),

    getters: {
        activeItems(state) {
            return state.items
                .map((item) => ({
                    ...item,
                    urgency: urgencyFor(item),
                }))
                .filter((item) => {
                    const stamp = state.dismissed[String(item.id)]
                    if (!stamp) return true
                    return stamp !== `${item.fecha_entrada}|${normalizeHora(item.hora_llegada) || ''}`
                })
                .sort((a, b) => {
                    const ua = URGENCY_ORDER[a.urgency] ?? 9
                    const ub = URGENCY_ORDER[b.urgency] ?? 9
                    if (ua !== ub) return ua - ub
                    const ha = normalizeHora(a.hora_llegada) || '99:99'
                    const hb = normalizeHora(b.hora_llegada) || '99:99'
                    if (ha !== hb) return ha.localeCompare(hb)
                    return Number(a.id) - Number(b.id)
                })
        },

        badgeCount() {
            return this.activeItems.length
        },

        grouped(state) {
            const groups = {
                vencida: { key: 'vencida', label: 'En retraso', items: [] },
                en_breve: { key: 'en_breve', label: 'En breve (2 h)', items: [] },
                hoy: { key: 'hoy', label: 'Hoy', items: [] },
                manana: { key: 'manana', label: 'Mañana', items: [] },
            }
            for (const item of this.activeItems) {
                groups[item.urgency]?.items.push(item)
            }
            return Object.values(groups).filter((g) => g.items.length)
        },
    },

    actions: {
        openDrawer() {
            this.drawerOpen = true
            this.refresh()
        },

        closeDrawer() {
            this.drawerOpen = false
        },

        toggleDrawer() {
            if (this.drawerOpen) this.closeDrawer()
            else this.openDrawer()
        },

        hydrateDismissed() {
            const auth = useAuthStore()
            const proyecto = useProyectoStore()
            this.dismissed = readDismissed(auth.user?.id, proyecto.casaActivaId)
        },

        dismiss(item) {
            const auth = useAuthStore()
            const proyecto = useProyectoStore()
            const next = {
                ...this.dismissed,
                [String(item.id)]: `${item.fecha_entrada}|${normalizeHora(item.hora_llegada) || ''}`,
            }
            this.dismissed = next
            writeDismissed(auth.user?.id, proyecto.casaActivaId, next)
        },

        dismissAll() {
            const auth = useAuthStore()
            const proyecto = useProyectoStore()
            const next = { ...this.dismissed }
            for (const item of this.activeItems) {
                next[String(item.id)] = `${item.fecha_entrada}|${normalizeHora(item.hora_llegada) || ''}`
            }
            this.dismissed = next
            writeDismissed(auth.user?.id, proyecto.casaActivaId, next)
        },

        async refresh() {
            const auth = useAuthStore()
            const proyecto = useProyectoStore()
            if (!auth.isAuthenticated || !auth.hasPermission('ver_reservas')) {
                this.items = []
                return
            }
            if (!proyecto.casaActivaId) {
                this.items = []
                return
            }

            this.hydrateDismissed()
            this.loading = true
            this.lastError = null
            try {
                const { data } = await api.get('/reservas/proximas-llegadas', {
                    showGenericError: false,
                })
                this.items = Array.isArray(data?.data) ? data.data : []
            } catch (error) {
                this.lastError = error.response?.data?.message || 'No se pudieron cargar las notificaciones.'
            } finally {
                this.loading = false
            }
        },

        startPolling() {
            this.stopPolling()
            this.refresh()
            this.pollTimer = window.setInterval(() => {
                this.refresh()
            }, POLL_MS)
        },

        stopPolling() {
            if (this.pollTimer) {
                window.clearInterval(this.pollTimer)
                this.pollTimer = null
            }
        },
    },
})
