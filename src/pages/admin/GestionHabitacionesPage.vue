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
            class="surface-card"
            row-key="id"
            :rows="filteredRows"
            :columns="columns"
            :loading="loading"
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
                        :style="{ background: props.row.color || '#0f766e' }"
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

        <q-dialog v-model="dialogOpen">
            <q-card style="min-width: 440px">
                <q-card-section>
                    <div class="text-h6">{{ editingId ? 'Editar habitación' : 'Nueva habitación' }}</div>
                </q-card-section>
                <q-card-section class="q-gutter-md">
                    <q-select
                        v-model="form.casa_id"
                        :options="casaOptions"
                        emit-value
                        map-options
                        outlined
                        label="Casa *"
                    />
                    <q-input v-model="form.nombre" outlined label="Nombre *" />
                    <q-input v-model="form.codigo" outlined label="Código" />
                    <q-select
                        v-model="form.tipo"
                        :options="tipoOptions"
                        emit-value
                        map-options
                        outlined
                        label="Tipo *"
                    />
                    <q-input
                        v-model.number="form.capacidad"
                        type="number"
                        min="1"
                        outlined
                        label="Capacidad (personas) *"
                        :hint="form.tipo === 'compartida'
                            ? 'Máximo de personas concurrentes en la habitación'
                            : 'Tope de personas de la habitación (queda bloqueada si hay una reserva)'"
                    />
                    <div>
                        <div class="text-caption text-grey-7 q-mb-xs">Color en calendario *</div>
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
                    <div>
                        <q-toggle
                            v-model="form.activo"
                            color="positive"
                            :label="form.activo ? 'Habitación activa' : 'Habitación inactiva'"
                        />
                        <div class="text-caption text-grey-7 q-mt-xs">
                            {{ form.activo
                                ? 'Disponible para nuevas reservas'
                                : 'No se ofrecerá para futuras reservas' }}
                        </div>
                    </div>
                    <q-input v-model="form.descripcion" outlined type="textarea" label="Descripción" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn color="primary" :label="editingId ? 'Guardar' : 'Crear'" :loading="saving" @click="saveHabitacion" />
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
const loading = ref(false)
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
    color: '#0f766e',
    activo: true,
    descripcion: ''
})

const tipoOptions = [
    { label: 'Privada', value: 'privada' },
    { label: 'Compartida', value: 'compartida' }
]

const colorPalette = [
    '#0f766e',
    '#1d4ed8',
    '#7c3aed',
    '#db2777',
    '#ea580c',
    '#ca8a04',
    '#059669',
    '#0891b2',
    '#dc2626',
    '#4f46e5',
    '#9333ea',
    '#0e7490'
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
    loading.value = true
    try {
        const { data } = await api.get('/habitaciones', { skipScopeParams: true })
        habitaciones.value = data.data ?? []
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudieron cargar las habitaciones.'
        })
    } finally {
        loading.value = false
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
.color-swatch {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    vertical-align: middle;
}

.color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.color-option {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
}

.color-option.is-selected {
    border-color: #0f172a;
    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
}
</style>
