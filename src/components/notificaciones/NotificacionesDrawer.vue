<template>
    <q-drawer
        v-model="drawerOpen"
        side="right"
        overlay
        bordered
        :width="drawerWidth"
        class="notif-drawer"
    >
        <div class="notif-shell column full-height">
            <div class="notif-head row items-center no-wrap">
                <div class="col">
                    <div class="notif-eyebrow">Recepción</div>
                    <div class="notif-title">Llegadas próximas</div>
                </div>
                <q-btn flat round dense icon="refresh" :loading="store.loading" @click="store.refresh()">
                    <q-tooltip>Actualizar</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="close" @click="store.closeDrawer()" />
            </div>

            <div v-if="store.badgeCount" class="notif-toolbar row items-center">
                <span class="notif-count">{{ store.badgeCount }} aviso{{ store.badgeCount === 1 ? '' : 's' }}</span>
                <q-space />
                <q-btn
                    flat
                    dense
                    no-caps
                    color="primary"
                    label="Marcar todas como vistas"
                    @click="store.dismissAll()"
                />
            </div>

            <div class="notif-body col">
                <div v-if="store.loading && !store.items.length" class="notif-empty">
                    <q-spinner color="primary" size="32px" />
                    <div>Cargando llegadas…</div>
                </div>

                <div v-else-if="store.lastError" class="notif-empty">
                    <q-icon name="error_outline" size="36px" color="negative" />
                    <div>{{ store.lastError }}</div>
                    <q-btn outline color="primary" no-caps label="Reintentar" @click="store.refresh()" />
                </div>

                <div v-else-if="!store.grouped.length" class="notif-empty">
                    <q-icon name="notifications_none" size="40px" color="grey-5" />
                    <div class="text-weight-medium">Sin llegadas próximas</div>
                    <div class="text-caption text-grey-6">
                        Aquí verás las reservas de hoy y mañana según se acerque la hora de llegada.
                    </div>
                </div>

                <div v-else class="notif-groups">
                    <section v-for="group in store.grouped" :key="group.key" class="notif-group">
                        <div class="notif-group-label" :class="`is-${group.key}`">{{ group.label }}</div>
                        <article
                            v-for="item in group.items"
                            :key="item.id"
                            class="notif-card"
                            :class="`is-${item.urgency}`"
                        >
                            <div class="notif-card-top row items-start no-wrap">
                                <div class="col">
                                    <div class="notif-name">{{ item.cliente_nombre }}</div>
                                    <div class="notif-meta">
                                        {{ item.habitacion_nombre }}
                                        · {{ item.cantidad_personas }} pax
                                        · {{ estadoLabel(item.estado) }}
                                    </div>
                                </div>
                                <q-btn
                                    flat
                                    round
                                    dense
                                    size="sm"
                                    icon="close"
                                    class="notif-dismiss"
                                    @click="store.dismiss(item)"
                                >
                                    <q-tooltip>Descartar</q-tooltip>
                                </q-btn>
                            </div>

                            <div class="notif-when">
                                <q-icon name="schedule" size="16px" />
                                <span>{{ formatWhen(item) }}</span>
                            </div>

                            <div class="notif-taxis row items-center q-gutter-xs">
                                <span class="notif-taxi" :class="item.taxi_llegada ? 'is-ok' : 'is-danger'">
                                    L {{ item.taxi_llegada ? '✓' : '✗' }}
                                </span>
                                <span class="notif-taxi" :class="item.taxi_salida ? 'is-ok' : 'is-danger'">
                                    S {{ item.taxi_salida ? '✓' : '✗' }}
                                </span>
                            </div>

                            <div class="notif-actions row q-gutter-sm">
                                <q-btn
                                    unelevated
                                    no-caps
                                    color="primary"
                                    icon="calendar_month"
                                    label="Ver en calendario"
                                    class="col"
                                    @click="goToReserva(item)"
                                />
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </div>
    </q-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useNotificacionesStore } from 'src/stores/notificaciones-store'

const $q = useQuasar()
const router = useRouter()
const store = useNotificacionesStore()

const drawerOpen = computed({
    get: () => store.drawerOpen,
    set: (value) => {
        store.drawerOpen = Boolean(value)
    },
})

const drawerWidth = computed(() => ($q.screen.width < 420 ? $q.screen.width : 380))

function estadoLabel(estado) {
    if (estado === 'pendiente') return 'Pendiente'
    if (estado === 'confirmada') return 'Confirmada'
    return estado || '—'
}

function formatWhen(item) {
    const fecha = String(item.fecha_entrada || '').slice(0, 10)
    const [y, m, d] = fecha.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const day = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    const hora = item.hora_llegada ? String(item.hora_llegada).slice(0, 5) : null
    if (hora) return `${day} · llegada ${hora}`
    return `${day} · hora sin definir`
}

async function goToReserva(item) {
    store.closeDrawer()
    await router.push({
        name: 'CalendarioReservas',
        query: {
            reserva_id: String(item.id),
            fecha: String(item.fecha_entrada || '').slice(0, 10),
        },
    })
}
</script>

<style scoped>
.notif-shell {
    background: var(--app-page-bg, #f8fafc);
}

.notif-head {
    gap: 4px;
    padding: 16px 14px 10px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: var(--app-surface, #fff);
}

.notif-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--q-primary);
}

.notif-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--app-ink, #0f172a);
    line-height: 1.2;
}

.notif-toolbar {
    padding: 8px 14px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: color-mix(in srgb, var(--q-primary) 6%, transparent);
}

.notif-count {
    font-size: 12px;
    font-weight: 700;
    color: var(--app-ink-2, #334155);
}

.notif-body {
    overflow: auto;
    padding: 12px 12px 20px;
}

.notif-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 220px;
    padding: 24px 16px;
    text-align: center;
    color: var(--app-ink-2, #475569);
}

.notif-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.notif-group-label {
    margin: 0 2px 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.notif-group-label.is-vencida { color: #b91c1c; }
.notif-group-label.is-en_breve { color: #c2410c; }
.notif-group-label.is-hoy { color: #0f766e; }
.notif-group-label.is-manana { color: #64748b; }

.notif-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 14px;
    background: var(--app-surface, #fff);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

.notif-card.is-vencida {
    border-color: rgba(185, 28, 28, 0.28);
    background: color-mix(in srgb, #ef4444 7%, var(--app-surface, #fff));
}

.notif-card.is-en_breve {
    border-color: rgba(194, 65, 12, 0.28);
    background: color-mix(in srgb, #f97316 7%, var(--app-surface, #fff));
}

.notif-name {
    font-size: 0.98rem;
    font-weight: 800;
    color: var(--app-ink, #0f172a);
    line-height: 1.25;
}

.notif-meta,
.notif-when {
    font-size: 12.5px;
    color: var(--app-ink-2, #475569);
}

.notif-when {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
}

.notif-taxi {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 7px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
}

.notif-taxi.is-ok {
    color: #047857;
    background: rgba(16, 185, 129, 0.12);
}

.notif-taxi.is-danger {
    color: #b91c1c;
    background: rgba(239, 68, 68, 0.12);
}

.notif-dismiss {
    color: var(--app-ink-2, #64748b);
}

:global(body.body--dark) .notif-shell,
:global(body.app-dark) .notif-shell {
    background: #1a222c;
}

:global(body.body--dark) .notif-head,
:global(body.app-dark) .notif-head,
:global(body.body--dark) .notif-card,
:global(body.app-dark) .notif-card {
    background: #243041;
    border-color: rgba(255, 255, 255, 0.08);
}

:global(body.body--dark) .notif-title,
:global(body.app-dark) .notif-title,
:global(body.body--dark) .notif-name,
:global(body.app-dark) .notif-name {
    color: #f8fafc;
}

:global(body.body--dark) .notif-meta,
:global(body.app-dark) .notif-meta,
:global(body.body--dark) .notif-when,
:global(body.app-dark) .notif-when,
:global(body.body--dark) .notif-count,
:global(body.app-dark) .notif-count {
    color: #cbd5e1;
}

:global(body.body--dark) .notif-taxi.is-ok,
:global(body.app-dark) .notif-taxi.is-ok {
    color: #6ee7b7;
    background: rgba(16, 185, 129, 0.16);
}

:global(body.body--dark) .notif-taxi.is-danger,
:global(body.app-dark) .notif-taxi.is-danger {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.18);
}
</style>
