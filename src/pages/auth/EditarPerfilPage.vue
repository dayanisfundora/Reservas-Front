<template>
    <q-page padding class="page-shell">
        <div class="page-header">
            <div>
                <div class="page-title">Editar perfil</div>
                <div class="page-subtitle">Actualiza tu nombre, el usuario con el que entras, tu correo y, si quieres, la contraseña.</div>
            </div>
        </div>

        <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-7">
                <q-card flat bordered class="surface-card">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Datos de la cuenta</div>
                    </q-card-section>
                    <q-card-section>
                        <q-form class="q-gutter-md" @submit="saveProfile">
                            <q-input
                                v-model="form.name"
                                outlined
                                label="Nombre completo"
                                autocomplete="name"
                                :disable="saving"
                                :error="Boolean(fieldErrors.name)"
                                :error-message="fieldErrors.name"
                                lazy-rules
                                :rules="[(value) => Boolean(String(value || '').trim()) || 'El nombre es obligatorio']"
                            >
                                <template #prepend><q-icon name="badge" /></template>
                            </q-input>

                            <q-input
                                v-model="form.username"
                                outlined
                                label="Usuario"
                                autocomplete="username"
                                :disable="saving"
                                :error="Boolean(fieldErrors.username)"
                                :error-message="fieldErrors.username"
                                lazy-rules
                                :rules="usernameRules"
                            >
                                <template #prepend><q-icon name="person_outline" /></template>
                            </q-input>

                            <q-input
                                v-model="form.email"
                                outlined
                                type="email"
                                label="Correo"
                                autocomplete="email"
                                :disable="saving"
                                :error="Boolean(fieldErrors.email)"
                                :error-message="fieldErrors.email"
                                lazy-rules
                                :rules="emailRules"
                            >
                                <template #prepend><q-icon name="mail_outline" /></template>
                            </q-input>

                            <q-separator />

                            <div>
                                <div class="text-subtitle2">Cambiar contraseña</div>
                                <div class="text-caption profile-caption">Déjala en blanco si no quieres cambiarla.</div>
                            </div>

                            <q-input
                                v-model="form.current_password"
                                outlined
                                :type="showCurrentPassword ? 'text' : 'password'"
                                label="Contraseña actual"
                                autocomplete="current-password"
                                :disable="saving"
                                :error="Boolean(fieldErrors.current_password)"
                                :error-message="fieldErrors.current_password"
                            >
                                <template #prepend><q-icon name="lock_outline" /></template>
                                <template #append>
                                    <q-icon
                                        :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showCurrentPassword = !showCurrentPassword"
                                    />
                                </template>
                            </q-input>

                            <q-input
                                v-model="form.password"
                                outlined
                                :type="showPassword ? 'text' : 'password'"
                                label="Nueva contraseña"
                                autocomplete="new-password"
                                hint="Mínimo 8 caracteres"
                                :disable="saving"
                                :error="Boolean(fieldErrors.password)"
                                :error-message="fieldErrors.password"
                            >
                                <template #prepend><q-icon name="lock_reset" /></template>
                                <template #append>
                                    <q-icon
                                        :name="showPassword ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showPassword = !showPassword"
                                    />
                                </template>
                            </q-input>

                            <q-input
                                v-model="form.password_confirmation"
                                outlined
                                :type="showPasswordConfirmation ? 'text' : 'password'"
                                label="Confirmar nueva contraseña"
                                autocomplete="new-password"
                                :disable="saving"
                            >
                                <template #prepend><q-icon name="lock_reset" /></template>
                                <template #append>
                                    <q-icon
                                        :name="showPasswordConfirmation ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showPasswordConfirmation = !showPasswordConfirmation"
                                    />
                                </template>
                            </q-input>

                            <div class="row justify-end">
                                <q-btn
                                    unelevated
                                    color="primary"
                                    type="submit"
                                    icon="save"
                                    label="Guardar cambios"
                                    :loading="saving"
                                />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-5">
                <q-card flat bordered class="surface-card">
                    <q-card-section class="column items-center q-gutter-sm profile-summary">
                        <q-avatar size="72px" class="profile-avatar">{{ initials }}</q-avatar>
                        <div class="text-h6">{{ authStore.userName }}</div>
                        <div class="profile-caption">@{{ authStore.user?.username }}</div>
                        <div class="profile-caption">{{ authStore.user?.email || 'Sin correo' }}</div>
                        <div class="row q-gutter-xs justify-center">
                            <q-badge v-for="role in authStore.userRoles" :key="role" color="primary" :label="role" />
                            <q-badge v-if="!authStore.userRoles.length" color="grey" label="Sin rol" />
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section>
                        <div class="text-subtitle2 q-mb-sm">Empresas con acceso</div>
                        <div v-if="empresaStore.empresas.length" class="column q-gutter-xs">
                            <div v-for="empresa in empresaStore.empresas" :key="empresa.id" class="row items-center no-wrap q-gutter-sm">
                                <q-icon name="apartment" color="primary" size="18px" />
                                <span class="ellipsis">{{ empresa.nombre }}</span>
                                <q-badge v-if="empresa.id === empresaStore.empresaActivaId" outline color="primary" label="Activa" />
                            </div>
                        </div>
                        <div v-else class="profile-caption">Sin empresas asignadas.</div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'
import { useEmpresaStore } from 'src/stores/empresa-store'

defineOptions({
    name: 'EditarPerfilPage',
})

const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const saving = ref(false)
const showCurrentPassword = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const form = reactive({
    name: authStore.user?.name ?? '',
    username: authStore.user?.username ?? '',
    email: authStore.user?.email ?? '',
    current_password: '',
    password: '',
    password_confirmation: '',
})

const fieldErrors = reactive({
    name: '',
    username: '',
    email: '',
    current_password: '',
    password: '',
})

const initials = computed(() => String(authStore.userName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(''))

const usernameRules = [
    (value) => Boolean(String(value || '').trim()) || 'El usuario es obligatorio',
    (value) => /^[A-Za-z0-9_-]+$/.test(String(value || '')) || 'Solo letras, números, guiones y guion bajo',
]

const emailRules = [
    (value) => Boolean(String(value || '').trim()) || 'El correo es obligatorio',
    (value) => /.+@.+\..+/.test(String(value || '')) || 'El correo no es válido',
]

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        fieldErrors[key] = ''
    }
}

function applyFieldErrors(error) {
    const errors = error.response?.data?.errors ?? {}

    for (const key of Object.keys(fieldErrors)) {
        const value = errors[key]
        fieldErrors[key] = Array.isArray(value) ? value[0] : ''
    }
}

function passwordChangeError() {
    const currentPassword = form.current_password.trim()
    const password = form.password
    const confirmation = form.password_confirmation
    const changingPassword = Boolean(currentPassword || password || confirmation)

    if (!changingPassword) {
        return ''
    }

    if (!currentPassword) {
        fieldErrors.current_password = 'Indica la contraseña actual para cambiarla.'
    }

    if (password.length < 8) {
        fieldErrors.password = 'La nueva contraseña debe tener al menos 8 caracteres.'
    } else if (password !== confirmation) {
        fieldErrors.password = 'La confirmación de la contraseña no coincide.'
    }

    return fieldErrors.current_password || fieldErrors.password
}

async function saveProfile() {
    clearFieldErrors()

    if (passwordChangeError()) {
        return
    }

    saving.value = true

    const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
    }

    if (form.password) {
        payload.current_password = form.current_password
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
    }

    try {
        const data = await authStore.updateProfile(payload)

        form.current_password = ''
        form.password = ''
        form.password_confirmation = ''

        Notify.create({
            type: 'positive',
            message: data.message || 'Perfil actualizado correctamente.',
            position: 'top-right',
        })
    } catch (error) {
        applyFieldErrors(error)
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo guardar el perfil.',
        })
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.profile-caption {
    color: var(--app-ink-muted);
}

.profile-summary {
    padding-top: 1.5rem;
    padding-bottom: 1.25rem;
}

.profile-avatar {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
    box-shadow: 0 10px 24px rgba(15, 118, 110, 0.25);
}
</style>
