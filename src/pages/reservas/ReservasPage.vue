<template>
    <q-page padding class="page-shell">
        <div class="page-header">
            <div>
                <div class="page-title">Reservas</div>
                <div class="page-subtitle">
                    Registre reservas y valide disponibilidad por habitación privada o compartida.
                </div>
            </div>
            <div class="page-toolbar q-gutter-sm">
                <q-select
                    v-model="filtroEstado"
                    :options="estadoOptions"
                    emit-value
                    map-options
                    outlined
                    dense
                    clearable
                    label="Estado"
                    style="min-width: 160px"
                />
                <q-btn flat color="primary" icon="calendar_month" label="Calendario" :to="{ name: 'CalendarioReservas' }" />
                <q-btn
                    v-if="canManage"
                    color="primary"
                    unelevated
                    icon="add"
                    label="Nueva reserva"
                    @click="openCreateDialog()"
                />
            </div>
        </div>

        <q-banner v-if="!casaActivaId" class="bg-warning text-dark q-mb-md" rounded>
            Seleccione una casa activa en el encabezado para filtrar las reservas de esa casa.
        </q-banner>

        <q-table
            flat
            bordered
            class="surface-card"
            row-key="id"
            :rows="reservas"
            :columns="columns"
            :loading="loading"
            :rows-per-page-options="[10, 25, 50]"
        >
            <template #body-cell-estado="props">
                <q-td :props="props">
                    <q-badge :color="estadoBadgeColor(props.row.estado)">
                        {{ estadoLabel(props.row.estado) }}
                    </q-badge>
                </q-td>
            </template>
            <template #body-cell-genero="props">
                <q-td :props="props">
                    <span v-if="formatGenerosResumen(props.row) !== '—'">{{ formatGenerosResumen(props.row) }}</span>
                    <span v-else class="text-grey-6">—</span>
                </q-td>
            </template>
            <template #body-cell-camas="props">
                <q-td :props="props">
                    {{ formatCamasResumen(props.row.camas) }}
                </q-td>
            </template>
            <template #body-cell-taxi="props">
                <q-td :props="props">
                    <div class="taxi-cell">
                        <div v-if="hasTaxi(props.row)" class="taxi-ok">
                            <q-icon name="local_taxi" size="16px" />
                            {{ formatTaxiResumen(props.row) }}
                        </div>
                        <div v-if="hasMissingTaxi(props.row)" class="taxi-warn">
                            <q-icon name="warning" size="16px" />
                            {{ formatTaxiAlerta(props.row) }}
                        </div>
                    </div>
                </q-td>
            </template>
            <template #body-cell-actions="props">
                <q-td :props="props">
                    <template v-if="canManage">
                        <q-btn
                            v-if="props.row.estado === 'pendiente'"
                            flat
                            dense
                            icon="check_circle"
                            color="positive"
                            @click="confirmarReserva(props.row)"
                        >
                            <q-tooltip>Confirmar</q-tooltip>
                        </q-btn>
                        <q-btn
                            flat
                            dense
                            icon="edit"
                            color="primary"
                            :disable="props.row.estado === 'cancelada'"
                            @click="openEditDialog(props.row)"
                        >
                            <q-tooltip>Editar</q-tooltip>
                        </q-btn>
                        <q-btn
                            flat
                            dense
                            icon="cancel"
                            color="negative"
                            :disable="props.row.estado === 'cancelada'"
                            @click="cancelarReserva(props.row)"
                        >
                            <q-tooltip>Cancelar</q-tooltip>
                        </q-btn>
                    </template>
                    <span v-else class="text-grey-6">—</span>
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="dialogOpen" persistent>
            <q-card class="reserva-dialog no-accent-bar">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{ editingId ? 'Editar reserva' : 'Nueva reserva' }}</div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-card-section class="q-pt-sm q-pb-none">
                    <div class="reserva-layout">
                        <section class="reserva-pane">
                            <div class="reserva-pane-title">Estancia</div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-12">
                                    <q-select
                                        v-model="form.habitacion_id"
                                        :options="habitacionOptions"
                                        emit-value
                                        map-options
                                        outlined
                                        dense
                                        label="Habitación *"
                                        hide-bottom-space
                                        @update:model-value="onHabitacionChange"
                                    />
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model="form.fecha_entrada"
                                        outlined
                                        dense
                                        label="Entrada *"
                                        mask="####-##-##"
                                        hide-bottom-space
                                        @update:model-value="onStayChange"
                                    >
                                        <template #append>
                                            <q-icon name="event" class="cursor-pointer">
                                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                    <q-date
                                                        v-model="form.fecha_entrada"
                                                        mask="YYYY-MM-DD"
                                                        @update:model-value="onStayChange"
                                                    >
                                                        <div class="row items-center justify-end">
                                                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                                        </div>
                                                    </q-date>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model.number="form.cantidad_noches"
                                        outlined
                                        dense
                                        type="number"
                                        min="1"
                                        label="Noches *"
                                        hide-bottom-space
                                        @update:model-value="onStayChange"
                                    />
                                </div>
                                <div class="col-4">
                                    <q-input
                                        :model-value="fechaSalidaCalculada"
                                        outlined
                                        dense
                                        label="Salida"
                                        readonly
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model.number="form.cantidad_personas"
                                        outlined
                                        dense
                                        type="number"
                                        min="1"
                                        label="Personas *"
                                        hide-bottom-space
                                        @update:model-value="onPersonasChange"
                                    />
                                </div>
                                <div class="col-8 flex items-center">
                                    <div class="text-caption text-grey-7">
                                        Camas * · {{ plazasCamas }} plazas / {{ form.cantidad_personas || 0 }} pers.
                                    </div>
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model.number="form.camas.matrimonial"
                                        outlined
                                        dense
                                        type="number"
                                        min="0"
                                        label="Matrimonial"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model.number="form.camas.twin"
                                        outlined
                                        dense
                                        type="number"
                                        min="0"
                                        label="Twin"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-4">
                                    <q-input
                                        v-model.number="form.camas.single"
                                        outlined
                                        dense
                                        type="number"
                                        min="0"
                                        label="Single"
                                        hide-bottom-space
                                    />
                                </div>
                                <template v-if="selectedHabitacionTipo === 'privada'">
                                    <div class="col-12 text-caption text-grey-7">Género por persona *</div>
                                    <div
                                        v-for="(_, idx) in form.generos"
                                        :key="`g-${idx}`"
                                        class="col-6"
                                    >
                                        <q-select
                                            v-model="form.generos[idx]"
                                            :options="generoOptions"
                                            emit-value
                                            map-options
                                            outlined
                                            dense
                                            :label="`Persona ${idx + 1}`"
                                            hide-bottom-space
                                            @update:model-value="checkDisponibilidad"
                                        />
                                    </div>
                                </template>
                                <div v-else class="col-6">
                                    <q-select
                                        v-model="form.genero"
                                        :options="generoOptions"
                                        emit-value
                                        map-options
                                        outlined
                                        dense
                                        label="Género *"
                                        hide-bottom-space
                                        @update:model-value="checkDisponibilidad"
                                    />
                                </div>
                            </div>
                        </section>

                        <section class="reserva-pane">
                            <div class="reserva-pane-title">Cliente y llegada</div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-12">
                                    <q-input v-model="form.cliente_nombre" outlined dense label="Nombre del cliente *" hide-bottom-space />
                                </div>
                                <div class="col-12">
                                    <q-input v-model="form.agencia" outlined dense label="Agencia" hide-bottom-space />
                                </div>
                                <div class="col-5">
                                    <q-input v-model="form.hora_llegada" outlined dense label="Hora llegada" type="time" hide-bottom-space />
                                </div>
                                <div class="col-7">
                                    <q-input v-model="form.vuelo" outlined dense label="Vuelo" hide-bottom-space />
                                </div>
                                <div class="col-6">
                                    <q-toggle v-model="form.taxi_llegada" dense color="teal" label="Taxi llegada" />
                                </div>
                                <div class="col-6">
                                    <q-toggle v-model="form.taxi_salida" dense color="teal" label="Taxi salida" />
                                </div>
                                <div class="col-12">
                                    <q-input
                                        v-model="form.notas"
                                        outlined
                                        dense
                                        type="textarea"
                                        :rows="2"
                                        label="Notas"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-12">
                                    <q-banner
                                        v-if="disponibilidad"
                                        dense
                                        rounded
                                        class="reserva-banner"
                                        :class="disponibilidad.disponible ? 'bg-positive text-white' : 'bg-negative text-white'"
                                    >
                                        <template v-if="disponibilidad.disponible">
                                            Disponible · Capacidad {{ disponibilidad.capacidad }} ·
                                            Ocupado {{ disponibilidad.ocupado }} · Restante {{ disponibilidad.restante }}
                                        </template>
                                        <template v-else>
                                            {{ disponibilidad.mensaje || 'Sin disponibilidad.' }}
                                        </template>
                                    </q-banner>
                                    <div v-else class="reserva-banner-placeholder text-caption text-grey-6">
                                        Complete habitación, fechas, personas y género para verificar disponibilidad.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="q-px-md q-pb-md">
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn
                        color="primary"
                        unelevated
                        :label="editingId ? 'Guardar' : 'Crear reserva'"
                        :loading="saving"
                        :disable="disponibilidad && !disponibilidad.disponible"
                        @click="saveReserva"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify, Dialog } from 'quasar'
import { api } from 'src/boot/axios'
import { useProyectoStore } from 'src/stores/proyecto-store'
import { useAuthStore } from 'src/stores/auth-store'
import {
    emptyCamas,
    formatCamasResumen,
    formatGenerosResumen,
    formatTaxiAlerta,
    formatTaxiResumen,
    hasMissingTaxi,
    hasTaxi,
    plazasFromCamas,
    syncGenerosList
} from 'src/assets/js/util/reservaFormHelpers'

defineOptions({
    name: 'ReservasPage'
})

const route = useRoute()
const router = useRouter()
const proyectoStore = useProyectoStore()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gestionar_reservas'))

const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editingId = ref(null)
const reservas = ref([])
const habitaciones = ref([])
const filtroEstado = ref('pendiente')
const disponibilidad = ref(null)
let disponibilidadTimer = null

const form = reactive({
    habitacion_id: null,
    cliente_nombre: '',
    genero: null,
    generos: [null],
    agencia: '',
    hora_llegada: '',
    vuelo: '',
    taxi_llegada: false,
    taxi_salida: false,
    cantidad_personas: 1,
    camas: emptyCamas(),
    cantidad_noches: 1,
    fecha_entrada: '',
    notas: ''
})

const estadoOptions = [
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Confirmadas', value: 'confirmada' },
    { label: 'Canceladas', value: 'cancelada' }
]

const generoOptions = [
    { label: 'Femenino', value: 'femenino' },
    { label: 'Masculino', value: 'masculino' }
]

const columns = [
    { name: 'cliente_nombre', label: 'Cliente', field: 'cliente_nombre', align: 'left' },
    { name: 'genero', label: 'Género', field: 'genero', align: 'center' },
    { name: 'habitacion', label: 'Habitación', field: (row) => row.habitacion?.nombre || '—', align: 'left' },
    { name: 'camas', label: 'Camas', field: (row) => formatCamasResumen(row.camas), align: 'left' },
    { name: 'agencia', label: 'Agencia', field: 'agencia', align: 'left' },
    { name: 'entrada', label: 'Entrada', field: 'fecha_entrada', align: 'center' },
    { name: 'salida', label: 'Salida', field: 'fecha_salida', align: 'center' },
    { name: 'noches', label: 'Noches', field: 'cantidad_noches', align: 'center' },
    { name: 'personas', label: 'Personas', field: 'cantidad_personas', align: 'center' },
    { name: 'hora', label: 'Llegada', field: 'hora_llegada', align: 'center' },
    { name: 'taxi', label: 'Taxi', field: (row) => formatTaxiResumen(row), align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const casaActivaId = computed(() => proyectoStore.casaActivaId)

const habitacionOptions = computed(() => {
    const casaId = casaActivaId.value
    return habitaciones.value
        .filter((h) => h.activo && (!casaId || h.casa_id === casaId))
        .map((h) => ({
            label: `${h.nombre} (${h.tipo}, cap. ${h.capacidad})`,
            value: h.id
        }))
})

const selectedHabitacionTipo = computed(() => {
    const room = habitaciones.value.find((h) => h.id === form.habitacion_id)
    return room?.tipo || null
})

const plazasCamas = computed(() => plazasFromCamas(form.camas))

const generoParaDisponibilidad = computed(() => {
    if (selectedHabitacionTipo.value === 'privada') {
        return form.generos.find((g) => g) || null
    }
    return form.genero
})

const fechaSalidaCalculada = computed(() => {
    if (!form.fecha_entrada || !form.cantidad_noches || form.cantidad_noches < 1) {
        return ''
    }
    const parts = String(form.fecha_entrada).split('-').map(Number)
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return ''
    }
    const start = new Date(parts[0], parts[1] - 1, parts[2])
    start.setDate(start.getDate() + Number(form.cantidad_noches))
    return formatLocalDate(start)
})

watch([filtroEstado, casaActivaId], () => {
    loadReservas()
})

function formatLocalDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function onStayChange() {
    checkDisponibilidad()
}

function onPersonasChange() {
    const size = Math.max(1, Number(form.cantidad_personas) || 1)
    form.cantidad_personas = size
    form.generos = syncGenerosList(form.generos, size)
    checkDisponibilidad()
}

function onHabitacionChange() {
    if (selectedHabitacionTipo.value === 'privada') {
        form.generos = syncGenerosList(form.generos, Math.max(1, Number(form.cantidad_personas) || 1))
        if (!form.generos[0] && form.genero) {
            form.generos[0] = form.genero
        }
    }
    checkDisponibilidad()
}

async function checkDisponibilidad() {
    clearTimeout(disponibilidadTimer)
    disponibilidad.value = null

    if (!form.habitacion_id || !form.fecha_entrada || !form.cantidad_noches || !form.cantidad_personas || !generoParaDisponibilidad.value) {
        return
    }

    disponibilidadTimer = setTimeout(async () => {
        try {
            const { data } = await api.get('/reservas/disponibilidad', {
                params: {
                    habitacion_id: form.habitacion_id,
                    fecha_entrada: form.fecha_entrada,
                    cantidad_noches: form.cantidad_noches,
                    cantidad_personas: form.cantidad_personas,
                    genero: generoParaDisponibilidad.value,
                    exclude_reserva_id: editingId.value || undefined
                },
                skipScopeParams: true
            })
            disponibilidad.value = data.data
        } catch (error) {
            disponibilidad.value = {
                disponible: false,
                mensaje: error.response?.data?.message
                    || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                    || 'No se pudo verificar disponibilidad.'
            }
        }
    }, 250)
}

async function loadHabitaciones() {
    const { data } = await api.get('/habitaciones', {
        params: { solo_activas: 1 },
        skipScopeParams: true
    })
    habitaciones.value = data.data ?? []
}

async function loadReservas() {
    loading.value = true
    try {
        const params = {}
        if (filtroEstado.value) {
            params.estado = filtroEstado.value
        }
        if (casaActivaId.value) {
            params.casa_id = casaActivaId.value
        }
        const { data } = await api.get('/reservas', { params, skipScopeParams: true })
        reservas.value = data.data ?? []
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudieron cargar las reservas.'
        })
    } finally {
        loading.value = false
    }
}

function resetForm(prefill = {}) {
    editingId.value = null
    disponibilidad.value = null
    form.habitacion_id = prefill.habitacion_id || null
    form.cliente_nombre = ''
    form.genero = prefill.genero || null
    form.generos = syncGenerosList([prefill.genero || null], prefill.cantidad_personas || 1)
    form.agencia = ''
    form.hora_llegada = ''
    form.vuelo = ''
    form.taxi_llegada = false
    form.taxi_salida = false
    form.cantidad_personas = prefill.cantidad_personas || 1
    form.camas = emptyCamas()
    form.cantidad_noches = prefill.cantidad_noches || 1
    form.fecha_entrada = prefill.fecha_entrada || formatLocalDate(new Date())
    form.notas = ''
}

function openCreateDialog(prefill = {}) {
    resetForm(prefill)
    dialogOpen.value = true
    checkDisponibilidad()
}

function openEditDialog(row) {
    editingId.value = row.id
    form.habitacion_id = row.habitacion_id
    form.cliente_nombre = row.cliente_nombre
    form.genero = row.genero || null
    form.generos = syncGenerosList(
        Array.isArray(row.generos) && row.generos.length ? row.generos : [row.genero || null],
        row.cantidad_personas || 1
    )
    form.agencia = row.agencia || ''
    form.hora_llegada = row.hora_llegada || ''
    form.vuelo = row.vuelo || ''
    form.taxi_llegada = Boolean(row.taxi_llegada)
    form.taxi_salida = Boolean(row.taxi_salida)
    form.cantidad_personas = row.cantidad_personas
    form.camas = {
        ...emptyCamas(),
        ...(row.camas || {})
    }
    form.cantidad_noches = row.cantidad_noches
    form.fecha_entrada = row.fecha_entrada
    form.notas = row.notas || ''
    dialogOpen.value = true
    checkDisponibilidad()
}

async function saveReserva() {
    const isPrivada = selectedHabitacionTipo.value === 'privada'
    const generosOk = isPrivada
        ? form.generos.length === form.cantidad_personas && form.generos.every(Boolean)
        : Boolean(form.genero)

    if (!form.habitacion_id || !form.cliente_nombre || !generosOk || !form.fecha_entrada || !form.cantidad_noches || !form.cantidad_personas) {
        Notify.create({ type: 'warning', message: 'Complete los campos obligatorios.' })
        return
    }

    if (plazasCamas.value < form.cantidad_personas) {
        Notify.create({ type: 'warning', message: 'Las camas no cubren la cantidad de personas.' })
        return
    }

    if (plazasFromCamas(form.camas) < 1 && (form.camas.matrimonial + form.camas.twin + form.camas.single) < 1) {
        Notify.create({ type: 'warning', message: 'Indique al menos una cama.' })
        return
    }

    saving.value = true
    try {
        const payload = {
            habitacion_id: form.habitacion_id,
            cliente_nombre: form.cliente_nombre,
            genero: isPrivada ? form.generos[0] : form.genero,
            generos: isPrivada ? form.generos : null,
            agencia: form.agencia || null,
            hora_llegada: form.hora_llegada || null,
            vuelo: form.vuelo || null,
            taxi_llegada: Boolean(form.taxi_llegada),
            taxi_salida: Boolean(form.taxi_salida),
            cantidad_personas: form.cantidad_personas,
            camas: {
                matrimonial: Number(form.camas.matrimonial) || 0,
                twin: Number(form.camas.twin) || 0,
                single: Number(form.camas.single) || 0
            },
            cantidad_noches: form.cantidad_noches,
            fecha_entrada: form.fecha_entrada,
            notas: form.notas || null
        }

        if (editingId.value) {
            await api.put(`/reservas/${editingId.value}`, payload)
            Notify.create({ type: 'positive', message: 'Reserva actualizada.' })
        } else {
            await api.post('/reservas', payload)
            Notify.create({ type: 'positive', message: 'Reserva creada (pendiente a confirmar).' })
        }

        dialogOpen.value = false
        await loadReservas()
        if (route.query.openCreate) {
            router.replace({ name: 'Reservas' })
        }
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message
                || error.response?.data?.errors?.disponibilidad?.[0]
                || error.response?.data?.errors?.camas?.[0]
                || error.response?.data?.errors?.generos?.[0]
                || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                || 'No se pudo guardar la reserva.'
        })
        await checkDisponibilidad()
    } finally {
        saving.value = false
    }
}

function estadoLabel(estado) {
    if (estado === 'pendiente') return 'Pendiente a confirmar'
    if (estado === 'confirmada') return 'Confirmada'
    if (estado === 'cancelada') return 'Cancelada'
    return estado || '—'
}

function estadoBadgeColor(estado) {
    if (estado === 'pendiente') return 'orange'
    if (estado === 'confirmada') return 'positive'
    return 'grey'
}

function confirmarReserva(row) {
    Dialog.create({
        title: 'Confirmar reserva',
        message: `¿Confirmar la reserva de ${row.cliente_nombre}?`,
        cancel: { flat: true, label: 'No', color: 'grey-8' },
        ok: { unelevated: true, label: 'Sí, confirmar', color: 'positive' },
        persistent: true
    }).onOk(async () => {
        try {
            await api.patch(`/reservas/${row.id}/confirmar`)
            Notify.create({ type: 'positive', message: 'Reserva confirmada.' })
            await loadReservas()
        } catch (error) {
            Notify.create({
                type: 'negative',
                message: error.response?.data?.message
                    || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                    || 'No se pudo confirmar.'
            })
        }
    })
}

function cancelarReserva(row) {
    Dialog.create({
        title: 'Cancelar reserva',
        message: `¿Cancelar la reserva de ${row.cliente_nombre}?`,
        cancel: { flat: true, label: 'No', color: 'grey-8' },
        ok: { unelevated: true, label: 'Sí, cancelar', color: 'negative' },
        persistent: true
    }).onOk(async () => {
        try {
            await api.patch(`/reservas/${row.id}/cancelar`)
            Notify.create({ type: 'positive', message: 'Reserva cancelada.' })
            await loadReservas()
        } catch (error) {
            Notify.create({
                type: 'negative',
                message: error.response?.data?.message
                    || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                    || 'No se pudo cancelar.'
            })
        }
    })
}

onMounted(async () => {
    if (!proyectoStore.initialized) {
        await proyectoStore.refreshCatalog()
    }
    await loadHabitaciones()
    await loadReservas()

    if (route.query.openCreate && canManage.value) {
        openCreateDialog({
            habitacion_id: route.query.habitacion_id ? Number(route.query.habitacion_id) : null,
            fecha_entrada: route.query.fecha_entrada || undefined,
            cantidad_noches: route.query.cantidad_noches ? Number(route.query.cantidad_noches) : 1
        })
    }
})
</script>

<style scoped>
.reserva-dialog {
    width: min(1200px, 98vw);
    max-width: 1200px;
}

.reserva-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: stretch;
}

.reserva-pane {
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 14px;
    background: #f8fafc;
}

.reserva-pane > .row {
    flex: 1;
}

.reserva-pane-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #0f766e;
    margin-bottom: 10px;
}

.reserva-banner {
    margin: 0;
}

.reserva-banner-placeholder {
    min-height: 40px;
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.03);
}

.taxi-ok {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #0f766e;
    font-weight: 600;
}

.taxi-warn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #c2410c;
    font-weight: 700;
}

.taxi-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

@media (max-width: 800px) {
    .reserva-layout {
        grid-template-columns: 1fr;
    }
}
</style>
