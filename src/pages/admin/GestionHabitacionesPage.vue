<template>
    <q-page padding class="page-shell">
        <div class="page-header">
            <div>
                <div class="page-title">Gestión de habitaciones</div>
                <div class="page-subtitle">
                    Configure habitaciones privadas o compartidas por casa del proyecto activo.
                </div>
            </div>
            <div class="page-toolbar q-gutter-sm">
                <q-select
                    v-model="filtroCasaId"
                    :options="casaOptions"
                    emit-value
                    map-options
                    outlined
                    dense
                    clearable
                    label="Filtrar por casa"
                    style="min-width: 220px"
                />
                <q-btn color="primary" unelevated icon="add" label="Nueva habitación" @click="openCreateDialog" />
            </div>
        </div>

        <q-table
            flat
            bordered
            class="surface-card theme-table"
            row-key="id"
            :rows="filteredRows"
            :columns="columns"
            :rows-per-page-options="[10, 25, 50]"
        >
            <template #body-cell-tipo="props">
                <q-td :props="props">
                    <q-badge :color="props.row.tipo === 'privada' ? 'primary' : 'secondary'">
                        {{ props.row.tipo === 'privada' ? 'Privada' : 'Compartida' }}
                    </q-badge>
                </q-td>
            </template>
            <template #body-cell-color="props">
                <q-td :props="props">
                    <span
                        class="color-swatch"
                        :style="{ background: props.row.color || '#7a1f2b' }"
                        :title="props.row.color"
                    />
                </q-td>
            </template>
            <template #body-cell-activo="props">
                <q-td :props="props">
                    <q-badge :color="props.row.activo ? 'positive' : 'grey'">
                        {{ props.row.activo ? 'Activa' : 'Inactiva' }}
                    </q-badge>
                </q-td>
            </template>
            <template #body-cell-actions="props">
                <q-td :props="props">
                    <q-btn flat dense icon="edit" color="primary" @click="openEditDialog(props.row)">
                        <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        flat
                        dense
                        :icon="props.row.activo ? 'block' : 'check_circle'"
                        :color="props.row.activo ? 'negative' : 'positive'"
                        @click="toggleActivo(props.row)"
                    >
                        <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="dialogOpen" persistent>
            <q-card class="habitacion-dialog no-accent-bar">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{ editingId ? 'Editar habitación' : 'Nueva habitación' }}</div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-card-section class="q-pt-md q-pb-none">
                    <div class="hab-pane">
                        <div class="hab-block">
                            <div class="hab-block-label">Ubicación e identidad</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-12">
                                    <q-select
                                        v-model="form.casa_id"
                                        :options="casaOptions"
                                        emit-value
                                        map-options
                                        outlined
                                        dense
                                        label="Casa *"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-12 col-sm-7">
                                    <q-input v-model="form.nombre" outlined dense label="Nombre *" hide-bottom-space />
                                </div>
                                <div class="col-12 col-sm-5">
                                    <q-input v-model="form.codigo" outlined dense label="Código" hide-bottom-space />
                                </div>
                            </div>
                        </div>

                        <div class="hab-block">
                            <div class="hab-block-label">Configuración</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-sm-6">
                                    <q-select
                                        v-model="form.tipo"
                                        :options="tipoOptions"
                                        emit-value
                                        map-options
                                        outlined
                                        dense
                                        label="Tipo *"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-12 col-sm-6">
                                    <q-input
                                        v-model.number="form.capacidad"
                                        type="number"
                                        min="1"
                                        outlined
                                        dense
                                        label="Capacidad (personas) *"
                                        hide-bottom-space
                                    />
                                </div>
                                <div class="col-12">
                                    <div class="hab-hint">
                                        {{ form.tipo === 'compartida'
                                            ? 'Máximo de personas concurrentes en la habitación.'
                                            : 'Tope de personas (queda bloqueada si hay una reserva).' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="hab-block">
                            <div class="hab-block-label">Color en calendario *</div>
                            <div class="color-palette">
                                <button
                                    v-for="c in colorPalette"
                                    :key="c"
                                    type="button"
                                    class="color-option"
                                    :class="{ 'is-selected': form.color === c }"
                                    :style="{ background: c }"
                                    :title="c"
                                    @click="form.color = c"
                                />
                            </div>
                        </div>

                        <div class="hab-block">
                            <div class="hab-status">
                                <q-toggle
                                    v-model="form.activo"
                                    color="primary"
                                    dense
                                    :label="form.activo ? 'Habitación activa' : 'Habitación inactiva'"
                                />
                                <div class="hab-hint">
                                    {{ form.activo
                                        ? 'Disponible para nuevas reservas.'
                                        : 'No se ofrecerá para futuras reservas.' }}
                                </div>
                            </div>
                        </div>

                        <div class="hab-block hab-block--last">
                            <q-input
                                v-model="form.descripcion"
                                outlined
                                dense
                                type="textarea"
                                :rows="3"
                                label="Descripción"
                                hide-bottom-space
                            />
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="q-px-md q-pb-md">
                    <q-btn flat no-caps label="Cancelar" v-close-popup />
                    <q-btn
                        unelevated
                        no-caps
                        color="primary"
                        class="hab-save-btn"
                        :label="editingId ? 'Guardar' : 'Crear'"
                        :loading="saving"
                        @click="saveHabitacion"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useProyectoStore } from 'src/stores/proyecto-store'

defineOptions({
    name: 'GestionHabitacionesPage'
})

const proyectoStore = useProyectoStore()
const saving = ref(false)
const dialogOpen = ref(false)
const editingId = ref(null)
const habitaciones = ref([])
const filtroCasaId = ref(null)

const form = reactive({
    casa_id: null,
    nombre: '',
    codigo: '',
    tipo: 'privada',
    capacidad: 1,
    color: '#7a1f2b',
    activo: true,
    descripcion: ''
})

const tipoOptions = [
    { label: 'Privada', value: 'privada' },
    { label: 'Compartida', value: 'compartida' }
]

const colorPalette = [
    '#7a1f2b',
    '#4a111b',
    '#8e2a36',
    '#b8893b',
    '#c4392a',
    '#6b2d8b',
    '#2f6fbf',
    '#1aa6a0',
    '#2e9b4a',
    '#e67a22',
    '#e6c20f',
    '#3b1a20'
]

const columns = [
    { name: 'casa', label: 'Casa', field: (row) => row.casa?.nombre || '—', align: 'left' },
    { name: 'nombre', label: 'Habitación', field: 'nombre', align: 'left' },
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
    { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
    { name: 'capacidad', label: 'Capacidad', field: 'capacidad', align: 'center' },
    { name: 'color', label: 'Color', field: 'color', align: 'center' },
    { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
    { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const casaOptions = computed(() =>
    (proyectoStore.casas || []).map((casa) => ({
        label: casa.nombre,
        value: casa.id
    }))
)

const filteredRows = computed(() => {
    if (!filtroCasaId.value) {
        return habitaciones.value
    }
    return habitaciones.value.filter((row) => row.casa_id === filtroCasaId.value)
})

watch(
    () => proyectoStore.casaActivaId,
    (casaId) => {
        if (casaId && filtroCasaId.value === null) {
            filtroCasaId.value = casaId
        }
    },
    { immediate: true }
)

async function loadHabitaciones() {
    try {
        const { data } = await api.get('/habitaciones', { skipScopeParams: true })
        habitaciones.value = data.data ?? []
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudieron cargar las habitaciones.'
        })
    }
}

function resetForm() {
    form.casa_id = proyectoStore.casaActivaId || filtroCasaId.value || casaOptions.value[0]?.value || null
    form.nombre = ''
    form.codigo = ''
    form.tipo = 'privada'
    form.capacidad = 1
    form.color = nextAvailableColor(form.casa_id)
    form.activo = true
    form.descripcion = ''
    editingId.value = null
}

function nextAvailableColor(casaId) {
    const used = new Set(
        habitaciones.value
            .filter((h) => !casaId || h.casa_id === casaId)
            .map((h) => (h.color || '').toLowerCase())
    )
    return colorPalette.find((c) => !used.has(c.toLowerCase())) || colorPalette[0]
}

function openCreateDialog() {
    resetForm()
    dialogOpen.value = true
}

function openEditDialog(row) {
    editingId.value = row.id
    form.casa_id = row.casa_id
    form.nombre = row.nombre
    form.codigo = row.codigo || ''
    form.tipo = row.tipo
    form.capacidad = row.capacidad
    form.color = row.color || nextAvailableColor(row.casa_id)
    form.activo = row.activo !== false
    form.descripcion = row.descripcion || ''
    dialogOpen.value = true
}

async function saveHabitacion() {
    if (!form.casa_id || !form.nombre || !form.tipo || !form.capacidad) {
        Notify.create({ type: 'warning', message: 'Complete los campos obligatorios.' })
        return
    }

    saving.value = true
    try {
        const payload = { ...form }
        if (editingId.value) {
            await api.put(`/habitaciones/${editingId.value}`, payload)
            Notify.create({ type: 'positive', message: 'Habitación actualizada correctamente.' })
        } else {
            await api.post('/habitaciones', payload)
            Notify.create({ type: 'positive', message: 'Habitación creada correctamente.' })
        }
        dialogOpen.value = false
        await loadHabitaciones()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message
                || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                || 'No se pudo guardar la habitación.'
        })
    } finally {
        saving.value = false
    }
}

async function toggleActivo(row) {
    try {
        await api.patch(`/habitaciones/${row.id}/activo`, { activo: !row.activo })
        await loadHabitaciones()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo actualizar el estado.'
        })
    }
}

onMounted(async () => {
    if (!proyectoStore.initialized) {
        await proyectoStore.refreshCatalog()
    }
    await loadHabitaciones()
})
</script>

<style scoped>
.habitacion-dialog {
    width: min(520px, 94vw);
    border-radius: 20px !important;
    border: 1px solid rgba(var(--theme-gold-light-rgb), 0.28) !important;
    overflow: hidden;
}

.hab-pane {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 2px 8px;
}

.hab-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(var(--theme-gold-rgb), 0.12);
}

.hab-block--last {
    border-bottom: 0;
    padding-bottom: 4px;
}

.hab-block-label {
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--app-ink-muted);
}

.hab-hint {
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--app-ink-muted);
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(var(--theme-wine-rgb), 0.06);
    border: 1px solid rgba(var(--theme-wine-rgb), 0.1);
}

.hab-status {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hab-save-btn {
    min-width: 108px;
}

.color-swatch {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid rgba(var(--theme-gold-rgb), 0.28);
    vertical-align: middle;
}

.color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.color-option {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 0 1px rgba(var(--theme-gold-rgb), 0.22);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-option:hover {
    transform: scale(1.06);
}

.color-option.is-selected {
    border-color: var(--theme-gold-light, #d4af6a);
    box-shadow:
        0 0 0 2px rgba(var(--theme-gold-light-rgb), 0.35),
        0 4px 12px rgba(var(--theme-wine-rgb), 0.28);
}
</style>

<style>
body.body--dark .habitacion-dialog,
body.app-dark .habitacion-dialog {
    background: var(--theme-dark) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.28) !important;
}

body.body--dark .hab-block,
body.app-dark .hab-block {
    border-bottom-color: rgba(var(--theme-gold-light-rgb), 0.1) !important;
}

body.body--dark .hab-block-label,
body.app-dark .hab-block-label {
    color: rgba(var(--theme-gold-pale-rgb, 239, 224, 191), 0.72) !important;
}

body.body--dark .hab-hint,
body.app-dark .hab-hint {
    color: var(--app-ink-muted, #b3a597) !important;
    background: rgba(var(--theme-wine-rgb), 0.16) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.14) !important;
}

body.body--dark .color-option.is-selected,
body.app-dark .color-option.is-selected {
    border-color: var(--theme-gold-pale) !important;
}
</style>
