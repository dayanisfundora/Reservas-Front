<template>
    <q-page padding class="page-shell reportes-page">
        <div class="page-header">
            <div>
                <div class="page-title">Reportes</div>
                <div class="page-subtitle">
                    Clientes por agencia, ocupación por casa y resumen anual. Solo cuentan las reservas confirmadas.
                </div>
            </div>
            <div class="page-toolbar report-actions">
                <q-btn
                    outline
                    color="primary"
                    icon="picture_as_pdf"
                    label="PDF"
                    :loading="downloadingPdf"
                    :disable="loading || downloadingPdf || printingPdf || !report"
                    @click="downloadPdf"
                >
                    <q-tooltip>Descargar el reporte en PDF</q-tooltip>
                </q-btn>
                <q-btn
                    outline
                    color="primary"
                    icon="print"
                    label="Imprimir"
                    :loading="printingPdf"
                    :disable="loading || downloadingPdf || printingPdf || !report"
                    @click="printPdf"
                >
                    <q-tooltip>Imprimir el reporte</q-tooltip>
                </q-btn>
            </div>
        </div>

        <q-card flat bordered class="surface-card filters-card q-mb-md">
            <q-card-section class="q-pb-sm">
                <q-btn-toggle
                    v-model="tipo"
                    :options="tipoOptions"
                    no-caps
                    unelevated
                    spread
                    toggle-color="primary"
                    class="tipo-toggle"
                />
            </q-card-section>
            <q-card-section class="row q-col-gutter-sm items-center">
                <div class="col-6 col-sm-3 col-md-2">
                    <q-select v-model="anio" :options="anioOptions" outlined dense label="Año" />
                </div>
                <div v-if="tipo !== 'anual'" class="col-6 col-sm-3 col-md-3">
                    <q-select
                        v-model="meses"
                        :options="mesOptions"
                        multiple
                        emit-value
                        map-options
                        outlined
                        dense
                        label="Meses"
                        :display-value="mesesLabel"
                        :error="mesesRequeridos"
                        error-message="Seleccione al menos un mes"
                        hide-bottom-space
                    >
                        <template #before-options>
                            <q-item clickable dense @click="toggleTodosLosMeses">
                                <q-item-section side>
                                    <q-checkbox
                                        :model-value="todosLosMeses"
                                        dense
                                        @update:model-value="toggleTodosLosMeses"
                                    />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-weight-medium">Todos los meses</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator />
                        </template>
                        <template #option="{ itemProps, opt, selected, toggleOption }">
                            <q-item v-bind="itemProps" dense>
                                <q-item-section side>
                                    <q-checkbox :model-value="selected" dense @update:model-value="toggleOption(opt)" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ opt.label }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                        v-model="casaId"
                        :options="casaOptions"
                        emit-value
                        map-options
                        outlined
                        dense
                        label="Casa"
                    />
                </div>
                <div v-if="tipo === 'clientes_agencia'" class="col-12 col-sm-6 col-md-3">
                    <q-select
                        v-model="agencia"
                        :options="agenciaOptions"
                        emit-value
                        map-options
                        outlined
                        dense
                        clearable
                        label="Agencia"
                    />
                </div>
            </q-card-section>
        </q-card>

        <div v-if="loading" class="flex flex-center q-pa-xl">
            <q-spinner color="primary" size="42px" />
        </div>

        <div v-else-if="mesesRequeridos" class="empty-state">
            Seleccione al menos un mes para ver los clientes por agencia.
        </div>

        <template v-else-if="report">
            <div class="report-heading q-mb-sm">
                <div class="report-title">{{ report.titulo }}</div>
                <div class="report-meta">{{ report.periodo }} · {{ report.casa }}</div>
            </div>

            <div class="kpi-grid q-mb-md">
                <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
                    <q-icon :name="kpi.icon" size="22px" class="kpi-icon" />
                    <div>
                        <div class="kpi-label">{{ kpi.label }}</div>
                        <div class="kpi-value">{{ kpi.value }}</div>
                    </div>
                </div>
            </div>

            <!-- Clientes por agencia -->
            <template v-if="report.tipo === 'clientes_agencia'">
                <div v-if="!report.agencias.length" class="empty-state">
                    No hay reservas confirmadas con llegada en este período.
                </div>
                <q-list v-else class="agency-list">
                    <q-expansion-item
                        v-for="grupo in report.agencias"
                        :key="grupo.agencia"
                        :default-opened="report.agencias.length <= 4"
                        class="agency-item surface-card"
                        header-class="agency-header"
                    >
                        <template #header>
                            <q-item-section avatar>
                                <q-icon name="storefront" color="primary" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="agency-name">{{ grupo.agencia }}</q-item-label>
                            </q-item-section>
                            <q-item-section side class="agency-badges">
                                <q-badge color="primary" :label="`${grupo.reservas} reservas`" />
                                <q-badge color="teal-7" :label="`${grupo.personas} personas`" />
                            </q-item-section>
                        </template>
                        <div class="table-wrap">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Casa</th>
                                        <th>Habitación</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th class="num">Noches</th>
                                        <th class="num">Personas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="cliente in grupo.clientes" :key="cliente.id">
                                        <td class="strong">{{ cliente.cliente_nombre }}</td>
                                        <td>{{ cliente.casa_nombre }}</td>
                                        <td>{{ cliente.habitacion_nombre }}</td>
                                        <td>{{ formatFecha(cliente.fecha_entrada) }}</td>
                                        <td>{{ formatFecha(cliente.fecha_salida) }}</td>
                                        <td class="num">{{ cliente.noches }}</td>
                                        <td class="num">{{ cliente.personas }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </q-expansion-item>
                </q-list>
            </template>

            <!-- Agencias y ocupación por casa -->
            <template v-else-if="report.tipo === 'agencias_ocupacion'">
                <div v-if="!report.casas.length" class="empty-state">No hay casas activas para este filtro.</div>
                <q-card v-for="casa in report.casas" :key="casa.casa_id" flat bordered class="surface-card q-mb-md">
                    <q-card-section class="casa-head">
                        <div>
                            <div class="casa-name">{{ casa.casa_nombre }}</div>
                            <div class="casa-meta">
                                {{ casa.habitaciones }} habitaciones · {{ formatNum(casa.total.disponibles) }} noches disponibles
                            </div>
                        </div>
                        <div class="casa-pct">
                            <span>{{ formatPct(casa.total.ocupacion) }}</span>
                            <small>ocupación</small>
                        </div>
                    </q-card-section>
                    <div class="table-wrap">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Agencia</th>
                                    <th class="num">Reservas</th>
                                    <th class="num">Personas</th>
                                    <th class="num">Noches-habitación</th>
                                    <th class="pct-col">Porciento de ocupación</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="!casa.agencias.length">
                                    <td colspan="5" class="muted">Sin reservas confirmadas en este período.</td>
                                </tr>
                                <tr v-for="fila in casa.agencias" :key="fila.agencia">
                                    <td class="strong">{{ fila.agencia }}</td>
                                    <td class="num">{{ formatNum(fila.reservas) }}</td>
                                    <td class="num">{{ formatNum(fila.personas) }}</td>
                                    <td class="num">{{ formatNum(fila.noches) }}</td>
                                    <td class="pct-col">
                                        <div class="pct-cell">
                                            <div class="pct-bar"><span :style="{ width: `${fila.ocupacion}%` }" /></div>
                                            <span class="pct-value">{{ formatPct(fila.ocupacion) }}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="total-row">
                                    <td>Total de la casa</td>
                                    <td class="num">{{ formatNum(casa.total.reservas) }}</td>
                                    <td class="num">{{ formatNum(casa.total.personas) }}</td>
                                    <td class="num">{{ formatNum(casa.total.noches) }}</td>
                                    <td class="pct-col">
                                        <div class="pct-cell">
                                            <div class="pct-bar"><span :style="{ width: `${casa.total.ocupacion}%` }" /></div>
                                            <span class="pct-value">{{ formatPct(casa.total.ocupacion) }}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </q-card>
            </template>

            <!-- Resumen anual -->
            <q-card v-else flat bordered class="surface-card">
                <div class="table-wrap">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Mes</th>
                                <th class="num">Reservas</th>
                                <th class="num">Personas</th>
                                <th class="num">Noches ocupadas</th>
                                <th class="num">Noches disponibles</th>
                                <th class="pct-col">Porciento de ocupación</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="fila in report.meses" :key="fila.mes">
                                <td class="strong">{{ fila.nombre }}</td>
                                <td class="num">{{ formatNum(fila.reservas) }}</td>
                                <td class="num">{{ formatNum(fila.personas) }}</td>
                                <td class="num">{{ formatNum(fila.noches) }}</td>
                                <td class="num">{{ formatNum(fila.disponibles) }}</td>
                                <td class="pct-col">
                                    <div class="pct-cell">
                                        <div class="pct-bar"><span :style="{ width: `${fila.ocupacion}%` }" /></div>
                                        <span class="pct-value">{{ formatPct(fila.ocupacion) }}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr class="total-row">
                                <td>Total del año</td>
                                <td class="num">{{ formatNum(report.totales.reservas) }}</td>
                                <td class="num">{{ formatNum(report.totales.personas) }}</td>
                                <td class="num">{{ formatNum(report.totales.noches) }}</td>
                                <td class="num">{{ formatNum(report.totales.disponibles) }}</td>
                                <td class="pct-col">
                                    <div class="pct-cell">
                                        <div class="pct-bar"><span :style="{ width: `${report.totales.ocupacion}%` }" /></div>
                                        <span class="pct-value">{{ formatPct(report.totales.ocupacion) }}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </q-card>
        </template>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useProyectoStore } from 'src/stores/proyecto-store'
import { downloadBlob, printPdfBlob } from 'src/assets/js/util/calendarPdfExport'

defineOptions({
    name: 'ReportesReservasPage'
})

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const tipoOptions = [
    { label: 'Clientes por agencia', value: 'clientes_agencia', icon: 'groups' },
    { label: 'Agencias y ocupación por casa', value: 'agencias_ocupacion', icon: 'home_work' },
    { label: 'Resumen anual', value: 'anual', icon: 'calendar_today' }
]

const proyectoStore = useProyectoStore()
const today = new Date()

const tipo = ref('clientes_agencia')
const anio = ref(today.getFullYear())
const meses = ref([today.getMonth() + 1])
const casaId = ref(proyectoStore.casaActivaId ?? null)
const agencia = ref(null)

const report = ref(null)
const loading = ref(false)
const downloadingPdf = ref(false)
const printingPdf = ref(false)
let requestSeq = 0

const anioOptions = computed(() => {
    const current = today.getFullYear()
    return Array.from({ length: 7 }, (_, i) => current + 1 - i)
})

const mesOptions = MESES.map((label, index) => ({ label, value: index + 1 }))

const todosLosMeses = computed(() => meses.value.length === 12)

const mesesRequeridos = computed(() => tipo.value === 'clientes_agencia' && meses.value.length === 0)

const mesesLabel = computed(() => {
    const seleccion = [...meses.value].sort((a, b) => a - b)
    if (seleccion.length === 0) {
        return tipo.value === 'agencias_ocupacion' ? 'Todo el año' : ''
    }
    if (seleccion.length === 12) return 'Todo el año'
    if (seleccion.length <= 2) return seleccion.map((m) => MESES[m - 1]).join(', ')
    return `${seleccion.length} meses`
})

function toggleTodosLosMeses() {
    meses.value = todosLosMeses.value ? [] : mesOptions.map((o) => o.value)
}

const casaOptions = computed(() => [
    { label: 'Todas las casas', value: null },
    ...proyectoStore.casas.map((c) => ({ label: c.nombre, value: c.id }))
])

const agenciaOptions = computed(() =>
    (report.value?.agencias_disponibles || []).map((a) => ({ label: a, value: a }))
)

const kpis = computed(() => {
    const r = report.value
    if (!r) return []
    const base = [
        { label: 'Reservas', value: formatNum(r.totales.reservas), icon: 'event_available' },
        { label: 'Personas', value: formatNum(r.totales.personas), icon: 'groups' }
    ]
    if (r.tipo === 'clientes_agencia') {
        return [...base, { label: 'Agencias', value: formatNum(r.totales.agencias), icon: 'storefront' }]
    }
    return [
        ...base,
        { label: 'Noches-habitación', value: formatNum(r.totales.noches), icon: 'hotel' },
        { label: 'Porciento de ocupación', value: formatPct(r.totales.ocupacion), icon: 'donut_large' }
    ]
})

function buildParams() {
    return {
        tipo: tipo.value,
        anio: anio.value,
        meses: tipo.value === 'anual' || meses.value.length === 0
            ? undefined
            : [...meses.value].sort((a, b) => a - b),
        casa_id: casaId.value ?? undefined,
        agencia: tipo.value === 'clientes_agencia' ? (agencia.value || undefined) : undefined
    }
}

function errorMessage(error, fallback) {
    const data = error?.response?.data
    return data?.message || Object.values(data?.errors || {})?.[0]?.[0] || error?.message || fallback
}

async function loadReport() {
    const seq = ++requestSeq
    if (mesesRequeridos.value) {
        report.value = null
        loading.value = false
        return
    }
    loading.value = true
    try {
        const { data } = await api.get('/reservas/reportes', { params: buildParams(), skipScopeParams: true })
        if (seq !== requestSeq) return
        report.value = data.data
    } catch (error) {
        if (seq !== requestSeq) return
        report.value = null
        Notify.create({ type: 'negative', message: errorMessage(error, 'No se pudo cargar el reporte.') })
    } finally {
        if (seq === requestSeq) loading.value = false
    }
}

async function parseBlobError(blob) {
    try {
        const parsed = JSON.parse(await blob.text())
        return parsed?.message || Object.values(parsed?.errors || {})?.[0]?.[0] || null
    } catch {
        return null
    }
}

async function requestPdf() {
    const response = await api.get('/reservas/reportes/pdf', {
        params: buildParams(),
        responseType: 'blob',
        skipScopeParams: true
    })
    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' })
    if (blob.type.includes('application/json')) {
        throw new Error((await parseBlobError(blob)) || 'No se pudo generar el PDF.')
    }
    const periodo = (report.value?.periodo || 'reporte').toLowerCase().replace(/[^a-z0-9]+/g, '_')
    return { blob, filename: `reporte_${tipo.value}_${periodo}.pdf` }
}

async function downloadPdf() {
    if (downloadingPdf.value || printingPdf.value) return
    downloadingPdf.value = true
    try {
        const { blob, filename } = await requestPdf()
        downloadBlob(blob, filename)
        Notify.create({ type: 'positive', message: 'PDF descargado.' })
    } catch (error) {
        const message = error?.response?.data instanceof Blob
            ? await parseBlobError(error.response.data)
            : null
        Notify.create({ type: 'negative', message: message || errorMessage(error, 'No se pudo generar el PDF.') })
    } finally {
        downloadingPdf.value = false
    }
}

async function printPdf() {
    if (downloadingPdf.value || printingPdf.value) return
    printingPdf.value = true
    try {
        const { blob } = await requestPdf()
        await printPdfBlob(blob, 'reportes-pdf-print-iframe')
    } catch (error) {
        const message = error?.response?.data instanceof Blob
            ? await parseBlobError(error.response.data)
            : null
        Notify.create({ type: 'negative', message: message || errorMessage(error, 'No se pudo imprimir el PDF.') })
    } finally {
        printingPdf.value = false
    }
}

function formatNum(value) {
    return Number(value || 0).toLocaleString('es-ES')
}

function formatPct(value) {
    return `${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function formatFecha(iso) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

watch(tipo, (nuevo) => {
    if (nuevo === 'clientes_agencia' && meses.value.length === 0) {
        meses.value = [today.getMonth() + 1]
    }
}, { flush: 'sync' })

watch([tipo, anio, meses, casaId], () => {
    agencia.value = null
}, { flush: 'sync' })

const paramsKey = computed(() => JSON.stringify(buildParams()))

watch(paramsKey, () => {
    loadReport()
})

onMounted(async () => {
    if (!proyectoStore.initialized) {
        try {
            await proyectoStore.refreshCatalog()
        } catch {
            // The casa selector falls back to "Todas las casas".
        }
    }
    loadReport()
})
</script>

<style scoped>
.report-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.filters-card {
    border-radius: 18px;
}

.tipo-toggle {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--app-border);
}

.tipo-toggle :deep(.q-btn) {
    font-weight: 600;
    min-height: 40px;
    color: var(--app-ink);
}

.tipo-toggle :deep(.q-btn.bg-primary) {
    color: #fff;
}

.report-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
}

.report-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--app-ink, inherit);
}

.report-meta {
    font-size: 0.85rem;
    color: var(--app-ink-muted);
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
}

.kpi-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow-md);
}

.kpi-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: var(--q-primary);
    background: color-mix(in srgb, var(--q-primary) 12%, transparent);
}

.kpi-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--app-ink-muted);
}

.kpi-value {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--q-primary);
    line-height: 1.2;
}

.agency-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.agency-item {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--app-border);
}

.agency-item :deep(.agency-header) {
    padding: 10px 14px;
}

.agency-name {
    font-weight: 700;
    font-size: 0.98rem;
}

.agency-badges {
    flex-direction: row;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.agency-badges :deep(.q-badge) {
    padding: 4px 8px;
    font-weight: 600;
}

.casa-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.casa-name {
    font-size: 1.05rem;
    font-weight: 700;
}

.casa-meta {
    font-size: 0.8rem;
    color: var(--app-ink-muted);
}

.casa-pct {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.1;
}

.casa-pct span {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--q-primary);
}

.casa-pct small {
    font-size: 0.7rem;
    color: var(--app-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.table-wrap {
    overflow-x: auto;
}

.report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.86rem;
}

.report-table th {
    text-align: left;
    padding: 9px 12px;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--app-ink-muted);
    background: var(--app-surface-muted);
    border-bottom: 1px solid var(--app-border);
    white-space: nowrap;
}

.report-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--app-border);
    white-space: nowrap;
}

.report-table .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.report-table .strong {
    font-weight: 600;
}

.report-table .muted {
    color: var(--app-ink-muted);
}

.report-table .total-row td {
    font-weight: 700;
    background: color-mix(in srgb, var(--q-primary) 8%, transparent);
    border-top: 2px solid color-mix(in srgb, var(--q-primary) 40%, transparent);
}

.pct-col {
    min-width: 180px;
}

.pct-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pct-bar {
    flex: 1;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--q-primary) 12%, transparent);
    overflow: hidden;
}

.pct-bar span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--q-primary);
}

.pct-value {
    min-width: 52px;
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.empty-state {
    padding: 28px;
    text-align: center;
    color: var(--app-ink-muted);
    border: 1px dashed var(--app-border);
    border-radius: 16px;
    background: var(--app-surface);
}

@media (max-width: 700px) {
    .tipo-toggle {
        flex-direction: column;
    }

    .report-actions {
        width: 100%;
    }

    .report-actions .q-btn {
        flex: 1;
    }

    .agency-badges {
        display: none;
    }
}
</style>
