/**
 * Helpers de presentación para reservas (camas / géneros).
 */

export function emptyCamas() {
    return { matrimonial: 0, twin: 0, single: 0 }
}

export function plazasFromCamas(camas) {
    const c = camas || emptyCamas()
    return (Number(c.matrimonial) || 0) * 2
        + (Number(c.twin) || 0) * 2
        + (Number(c.single) || 0) * 1
}

export function formatCamasResumen(camas) {
    if (!camas || typeof camas !== 'object') return '—'
    const parts = []
    if (camas.matrimonial > 0) parts.push(`${camas.matrimonial} Mat.`)
    if (camas.twin > 0) parts.push(`${camas.twin} Twin`)
    if (camas.single > 0) parts.push(`${camas.single} Single`)
    return parts.length ? parts.join(' · ') : '—'
}

export function formatGenerosResumen(row) {
    const list = Array.isArray(row?.generos) && row.generos.length
        ? row.generos
        : (row?.genero ? [row.genero] : [])
    if (!list.length) return '—'
    const f = list.filter((g) => g === 'femenino').length
    const m = list.filter((g) => g === 'masculino').length
    if (list.length === 1) {
        return list[0] === 'femenino' ? 'Femenino' : 'Masculino'
    }
    const parts = []
    if (f) parts.push(`${f}F`)
    if (m) parts.push(`${m}M`)
    return parts.join(' / ')
}

export function syncGenerosList(current, size) {
    const next = Array.isArray(current) ? [...current] : []
    while (next.length < size) next.push(null)
    if (next.length > size) next.length = size
    return next
}

/** Resumen corto: "Llegada · Salida", "Llegada", "Salida" o "—" */
export function formatTaxiResumen(row) {
    const parts = []
    if (row?.taxi_llegada) parts.push('Llegada')
    if (row?.taxi_salida) parts.push('Salida')
    return parts.length ? parts.join(' · ') : '—'
}

export function hasTaxi(row) {
    return Boolean(row?.taxi_llegada || row?.taxi_salida)
}

/** Qué taxis faltan: ["llegada"], ["salida"], ["llegada","salida"] o [] */
export function missingTaxiParts(row) {
    const missing = []
    if (!row?.taxi_llegada) missing.push('llegada')
    if (!row?.taxi_salida) missing.push('salida')
    return missing
}

export function hasMissingTaxi(row) {
    return missingTaxiParts(row).length > 0
}

/** Ej: "Sin taxi de llegada y salida" / "Sin taxi de llegada" */
export function formatTaxiAlerta(row) {
    const missing = missingTaxiParts(row)
    if (!missing.length) return ''
    if (missing.length === 2) return 'Sin taxi de llegada ni de salida'
    return missing[0] === 'llegada' ? 'Sin taxi de llegada' : 'Sin taxi de salida'
}

/** Compacto para celdas del calendario */
export function formatTaxiAlertaCorta(row) {
    const missing = missingTaxiParts(row)
    if (!missing.length) return ''
    if (missing.length === 2) return 'Sin taxi L/S'
    return missing[0] === 'llegada' ? 'Sin taxi L' : 'Sin taxi S'
}
