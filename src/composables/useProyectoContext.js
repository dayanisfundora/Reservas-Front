import { computed } from 'vue'
import { useProyectoStore } from 'src/stores/proyecto-store'

/**
 * Shared helpers for casa scope in forms and API calls.
 */
export function useProyectoContext() {
    const proyectoStore = useProyectoStore()

    const casaOptions = computed(() => {
        return proyectoStore.casas.map((casa) => ({
            label: casa.nombre,
            value: casa.id
        }))
    })

    const casaFilterOptions = computed(() => {
        return [
            { label: 'Todas las casas', value: null },
            ...casaOptions.value
        ]
    })

    function scopeParams(extra = {}) {
        return {
            ...proyectoStore.scopeQueryParams,
            ...extra
        }
    }

    return {
        proyectoStore,
        casaOptions,
        casaFilterOptions,
        scopeParams
    }
}
