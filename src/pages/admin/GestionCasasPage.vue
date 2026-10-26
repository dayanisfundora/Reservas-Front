<template>
    <q-page padding class="page-shell">
        <div class="page-header">
            <div>
                <div class="page-title">Gestión de casas</div>
                <div class="page-subtitle">
                    Administre las casas del proyecto activo: {{ proyectoActivoNombre }}.
                </div>
            </div>
            <div class="page-toolbar">
                <q-btn color="primary" unelevated icon="add" label="Nueva casa" @click="openCreateDialog" />
            </div>
        </div>

        <q-table
            flat
            bordered
            class="surface-card"
            row-key="id"
            :rows="casas"
            :columns="columns"
            :loading="loading"
            :rows-per-page-options="[10, 25, 50]"
        >
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
                        <q-tooltip>Editar casa</q-tooltip>
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
            <q-card style="min-width: 420px">
                <q-card-section>
                    <div class="text-h6">{{ editingId ? 'Editar casa' : 'Nueva casa' }}</div>
                </q-card-section>
                <q-card-section class="q-gutter-md">
                    <q-input v-model="form.nombre" outlined label="Nombre de la casa *" />
                    <q-input v-model="form.codigo" outlined label="Código" />
                    <q-input
                        v-model="form.objeto_arrendamiento_default"
                        outlined
                        label="Objeto de arrendamiento por defecto"
                        hint="Se usa al registrar ingresos/gastos de esta casa"
                    />
                    <q-input v-model="form.descripcion" outlined type="textarea" label="Descripción" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn color="primary" :label="editingId ? 'Guardar' : 'Crear'" :loading="saving" @click="saveCasa" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useProyectoStore } from 'src/stores/proyecto-store'

defineOptions({
    name: 'GestionCasasPage'
})

const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editingId = ref(null)
const casas = ref([])
const empresaStore = useEmpresaStore()
const proyectoStore = useProyectoStore()

const form = reactive({
    nombre: '',
    codigo: '',
    objeto_arrendamiento_default: '',
    descripcion: ''
})

const columns = [
    { name: 'nombre', label: 'Casa', field: 'nombre', align: 'left' },
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
    { name: 'objeto_arrendamiento_default', label: 'Objeto por defecto', field: 'objeto_arrendamiento_default', align: 'left' },
    { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
    { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const proyectoActivoNombre = computed(() => {
    return empresaStore.empresaActiva?.nombre_corto || empresaStore.empresaActiva?.nombre || 'Sin proyecto seleccionado'
})

async function loadCasas() {
    loading.value = true

    try {
        const { data } = await api.get('/casas', { skipScopeParams: true })
        casas.value = data.data ?? []
    } finally {
        loading.value = false
    }
}

function resetForm() {
    form.nombre = ''
    form.codigo = ''
    form.objeto_arrendamiento_default = ''
    form.descripcion = ''
    editingId.value = null
}

function openCreateDialog() {
    resetForm()
    dialogOpen.value = true
}

function openEditDialog(casa) {
    editingId.value = casa.id
    form.nombre = casa.nombre
    form.codigo = casa.codigo || ''
    form.objeto_arrendamiento_default = casa.objeto_arrendamiento_default || ''
    form.descripcion = casa.descripcion || ''
    dialogOpen.value = true
}

async function saveCasa() {
    saving.value = true

    try {
        if (editingId.value) {
            await api.put(`/casas/${editingId.value}`, { ...form })
            Notify.create({ type: 'positive', message: 'Casa actualizada correctamente.' })
        } else {
            await api.post('/casas', { ...form })
            Notify.create({ type: 'positive', message: 'Casa creada correctamente.' })
        }

        dialogOpen.value = false
        await loadCasas()
        await proyectoStore.refreshCatalog()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo guardar la casa.'
        })
    } finally {
        saving.value = false
    }
}

async function toggleActivo(casa) {
    try {
        await api.patch(`/casas/${casa.id}/activo`, {
            activo: !casa.activo
        })

        await loadCasas()
        await proyectoStore.refreshCatalog()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo actualizar el estado.'
        })
    }
}

onMounted(async () => {
    await loadCasas()
})
</script>
