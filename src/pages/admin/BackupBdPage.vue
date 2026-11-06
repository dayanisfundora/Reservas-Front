<template>
    <div class="admin-page q-pa-md q-pa-lg-xl" v-if="canBackup">
        <DialogLoad :dialog-load="loading || restoring" />
        <div class="admin-hero q-mb-lg">
            <div>
                <p class="admin-eyebrow">Seguridad</p>
                <h1 class="admin-title">Respaldo de base de datos</h1>
                <p class="admin-text">
                    Descarga un archivo .sql o restaura la base de datos desde un respaldo anterior, sin entrar a Navicat.
                </p>
            </div>
        </div>

        <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
                <q-card flat class="admin-card">
                    <q-card-section>
                        <div class="text-h6 text-primary text-weight-bold">Descargar respaldo</div>
                        <div class="text-grey-7 q-mt-sm">
                            Guarda un archivo <strong>.sql</strong> en tu equipo con los datos actuales del sistema.
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <q-btn
                            unelevated
                            color="primary"
                            icon="download"
                            label="Descargar respaldo"
                            :loading="loading"
                            :disable="loading || restoring"
                            @click="downloadBackup"
                        />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card flat class="admin-card">
                    <q-card-section>
                        <div class="text-h6 text-primary text-weight-bold">Restaurar respaldo</div>
                        <div class="text-grey-7 q-mt-sm">
                            Elige un archivo <strong>.sql</strong> descargado antes. Esto reemplaza los datos actuales.
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <q-file
                            v-model="restoreFile"
                            outlined
                            accept=".sql"
                            label="Seleccionar archivo .sql"
                            :disable="loading || restoring"
                            clearable
                        >
                            <template v-slot:prepend>
                                <q-icon name="upload_file" />
                            </template>
                        </q-file>
                    </q-card-section>

                    <q-card-section>
                        <q-btn
                            unelevated
                            color="negative"
                            icon="restore"
                            label="Restaurar base de datos"
                            :loading="restoring"
                            :disable="loading || restoring"
                            @click="openRestoreDialog"
                        />
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <q-dialog v-model="restoreDialogOpen" persistent>
            <q-card style="min-width: 360px; max-width: 460px; width: 100%;">
                <q-card-section>
                    <div class="text-h6">Restaurar base de datos</div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    Esto reemplazará los datos actuales del sistema con el archivo seleccionado.
                    ¿Desea continuar?
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="grey-8" :disable="restoring" @click="restoreDialogOpen = false" />
                    <q-btn unelevated label="Restaurar" color="negative" :loading="restoring" @click="restoreBackup" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>

    <div v-else class="q-pa-md">
        <q-banner class="bg-negative text-white" rounded>
            No tienes permiso para respaldar la base de datos.
        </q-banner>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth-store'
import DialogLoad from 'src/components/dialog_boxes/DialogLoad.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)
const restoring = ref(false)
const restoreFile = ref(null)
const restoreDialogOpen = ref(false)

const canBackup = computed(() => authStore.hasPermission('respaldar_bd'))

/**
 * Build a safe .sql download name so Navicat recognizes the file extension.
 *
 * @param {string|undefined} disposition
 * @returns {string}
 */
const resolveSqlFilename = (disposition) => {
    const fallback = `backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.sql`
    if (!disposition) {
        return fallback
    }

    const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
    const plainMatch = disposition.match(/filename\s*=\s*("?)([^";]+)\1/i)
    let name = utf8Match?.[1] || plainMatch?.[2] || ''

    try {
        name = decodeURIComponent(name.trim())
    } catch {
        name = name.trim()
    }

    name = name.replace(/^["']|["']$/g, '')
    if (!name.toLowerCase().endsWith('.sql')) {
        name = `${name || 'backup'}.sql`
    }

    return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_') || fallback
}

/**
 * Download a MySQL .sql dump from the API.
 *
 * @returns {Promise<void>}
 */
const downloadBackup = async () => {
    if (!canBackup.value) {
        return
    }

    loading.value = true

    try {
        const response = await api.get('/backup/database', {
            responseType: 'blob',
        })

        const contentType = response.headers['content-type'] || ''

        if (contentType.includes('application/json')) {
            const text = await response.data.text()
            const payload = JSON.parse(text)
            throw new Error(payload.message || payload.error || 'No se pudo generar el respaldo')
        }

        const filename = resolveSqlFilename(response.headers['content-disposition'])
        const blob = new Blob([response.data], { type: 'application/sql' })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()

        setTimeout(() => {
            document.body.removeChild(anchor)
            window.URL.revokeObjectURL(url)
        }, 100)

        $q.notify({
            type: 'positive',
            message: 'Respaldo descargado correctamente',
            position: 'top-right',
        })
    } catch (error) {
        let message = error.message || 'Error al descargar el respaldo'

        if (error.response?.data instanceof Blob) {
            try {
                const text = await error.response.data.text()
                const payload = JSON.parse(text)
                message = payload.message || payload.error || message
            } catch {
                // keep default message
            }
        } else if (error.response?.data?.message) {
            message = error.response.data.message
        }

        $q.notify({
            type: 'negative',
            message,
            position: 'top-right',
        })
    } finally {
        loading.value = false
    }
}

/**
 * Open the restore confirmation dialog after validating a .sql file is selected.
 *
 * @returns {void}
 */
const openRestoreDialog = () => {
    const file = getSelectedFile()
    if (!file) {
        $q.notify({
            type: 'warning',
            message: 'Seleccione primero un archivo .sql',
            position: 'top-right',
        })
        return
    }

    restoreDialogOpen.value = true
}

/**
 * Resolve the File object from q-file (File or File[]).
 *
 * @returns {File|null}
 */
const getSelectedFile = () => {
    const value = restoreFile.value
    if (!value) {
        return null
    }

    if (Array.isArray(value)) {
        return value[0] || null
    }

    return value
}

/**
 * Upload the selected .sql dump and restore the database.
 *
 * @returns {Promise<void>}
 */
const restoreBackup = async () => {
    const file = getSelectedFile()
    if (!canBackup.value || !file) {
        return
    }

    restoring.value = true

    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/backup/restore', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000,
            skipAuthRedirect: true,
            showGenericError: false,
        })

        if (response.data?.token) {
            authStore.token = response.data.token
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
            authStore.persistSession()
        }

        restoreFile.value = null
        restoreDialogOpen.value = false
        $q.notify({
            type: 'positive',
            message: response.data?.message || 'Base de datos restaurada correctamente',
            position: 'top-right',
        })
    } catch (error) {
        const status = error.response?.status
        let message = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al restaurar'

        if (status === 401) {
            message = 'La sesion se invalido durante la restauracion. Inicie sesion de nuevo.'
        } else if (error.code === 'ECONNABORTED') {
            message = 'La restauracion tardo demasiado. Verifique el archivo e intente de nuevo.'
        }

        $q.notify({
            type: 'negative',
            message,
            position: 'top-right',
        })
    } finally {
        restoring.value = false
    }
}
</script>

<style scoped>
.admin-page {
    background: transparent;
    min-height: calc(100vh - 60px);
    animation: pageEnter 0.45s ease both;
}

.admin-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem 1.75rem;
    border-radius: 22px;
    background:
        radial-gradient(circle at 90% 10%, rgba(217, 119, 6, 0.28), transparent 40%),
        linear-gradient(135deg, #0f172a 0%, #0f766e 55%, #0d9488 100%);
    color: white;
    box-shadow: 0 24px 50px rgba(15, 118, 110, 0.22);
}

.admin-eyebrow {
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(94, 234, 212, 0.9);
}

.admin-title {
    margin: 0;
    font-family: var(--app-font-display);
    font-weight: 600;
    letter-spacing: -0.02em;
    font-size: clamp(1.6rem, 2.8vw, 2.4rem);
}

.admin-text {
    margin: 1rem 0 0;
    max-width: 42rem;
    color: rgba(236, 253, 245, 0.85);
    line-height: 1.55;
}

.admin-card {
    border-radius: 20px;
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow-md);
}
</style>
