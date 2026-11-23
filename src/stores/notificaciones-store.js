import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useAuthStore } from './auth-store'
import { useProyectoStore } from './proyecto-store'

const STORAGE_PREFIX = 'reservas-notif-dismissed-v3'
const POLL_MS = 60_000
const BRIEF_HOURS = 2
const LATE_WITHOUT_TIME_HOUR = 14
/** Hora de referencia para salidas sin hora explícita (checkout habitual). */
const DEFAULT_SALIDA_HORA = '12:00'

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

function itemTipo(item) {
    return item?.tipo === 'salida' ? 'salida' : 'entrada'
}

function itemFecha(item) {
    if (itemTipo(item) === 'salida') {
        return String(item.fecha_evento || item.fecha_salida || '').slice(0, 10)
    }
    return String(item.fecha_evento || item.fecha_entrada || '').slice(0, 10)
}

function itemHora(item) {
    if (itemTipo(item) === 'salida') {
        return normalizeHora(item.hora_evento) || DEFAULT_SALIDA_HORA
    }
    return normalizeHora(item.hora_llegada || item.hora_evento)
}

function itemStamp(item) {
    const hora = itemTipo(item) === 'salida'
        ? (normalizeHora(item.hora_evento) || '')
        : (normalizeHora(item.hora_llegada || item.hora_evento) || '')
    return `${itemTipo(item)}|${itemFecha(item)}|${hora}`
}

function itemKey(item) {
    return `${itemTipo(item)}-${item.id}`
}

function arrivalDateTime(fechaIso, hora) {
    const [y, m, d] = String(fechaIso).split('-').map(Number)
    const hhmm = normalizeHora(hora)
    const [hh, mm] = hhmm ? hhmm.split(':').map(Number) : [0, 0]
    return new Date(y, m - 1, d, hh, mm, 0, 0)
}

function dismissKey(userId) {
    // Un solo bucket por usuario: al cambiar Todas/casa no se pierden ni “reaparecen” avisos.
    return `${STORAGE_PREFIX}:${userId || 'anon'}`
}

function readDismissed(userId) {
    try {
        const raw = window.localStorage.getItem(dismissKey(userId))
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {}
    }
}

function writeDismissed(userId, map) {
    window.localStorage.setItem(dismissKey(userId), JSON.stringify(map))
}

function urgencyFor(item, now = new Date()) {
    const hoy = todayIso(now)
    const manana = addDaysIso(hoy, 1)
    const fecha = itemFecha(item)
    const horaExplicit = itemTipo(item) === 'salida'
        ? normalizeHora(item.hora_evento)
        : normalizeHora(item.hora_llegada || item.hora_evento)
    const hora = itemHora(item)
    const when = arrivalDateTime(fecha, hora || '00:00')

    if (fecha === hoy) {
        if (horaExplicit || itemTipo(item) === 'salida') {
            if (when.getTime() < now.getTime()) return 'vencida'
            const msLeft = when.getTime() - now.getTime()
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
const TIPO_ORDER = { entrada: 0, salida: 1 }

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
            const proyecto = useProyectoStore()
            const casaFiltro = proyecto.casaActivaId

            return state.items
                .map((item) => ({
                    ...item,
                    tipo: itemTipo(item),
                    key: itemKey(item),
                    urgency: urgencyFor(item),
                }))
                .filter((item) => {
                    if (casaFiltro != null && Number(item.casa_id) !== Number(casaFiltro)) {
                        return false
                    }
                    const stamp = state.dismissed[item.key]
                    if (!stamp) return true
                    return stamp !== itemStamp(item)
                })
                .sort((a, b) => {
                    const ua = URGENCY_ORDER[a.urgency] ?? 9
                    const ub = URGENCY_ORDER[b.urgency] ?? 9
                    if (ua !== ub) return ua - ub
                    const ha = itemHora(a) || '99:99'
                    const hb = itemHora(b) || '99:99'
                    if (ha !== hb) return ha.localeCompare(hb)
                    const ta = TIPO_ORDER[a.tipo] ?? 9
                    const tb = TIPO_ORDER[b.tipo] ?? 9
                    if (ta !== tb) return ta - tb
                    return Number(a.id) - Number(b.id)
                })
        },

        badgeCount() {
            return this.activeItems.length
        },

        grouped() {
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
            this.dismissed = readDismissed(auth.user?.id)
        },

        dismiss(item) {
            const auth = useAuthStore()
            const next = {
                ...this.dismissed,
                [itemKey(item)]: itemStamp(item),
            }
            this.dismissed = next
            writeDismissed(auth.user?.id, next)
        },

        dismissAll() {
            const auth = useAuthStore()
            const next = { ...this.dismissed }
            for (const item of this.activeItems) {
                next[itemKey(item)] = itemStamp(item)
            }
            this.dismissed = next
            writeDismissed(auth.user?.id, next)
        },

        async refresh() {
            const auth = useAuthStore()
            if (!auth.isAuthenticated || !auth.hasPermission('ver_reservas')) {
                this.items = []
                return
            }

            this.hydrateDismissed()
            this.loading = true
            this.lastError = null
            try {
                // Siempre pedimos todas las casas; el filtro Todas/casa se aplica en activeItems.
                const { data } = await api.get('/reservas/proximas-llegadas', {
                    showGenericError: false,
                    skipScopeParams: true,
                    params: {},
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
