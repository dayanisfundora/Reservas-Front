<template>
    <div class="reset-page flex column flex-center q-pa-lg">
        <q-card flat class="reset-card no-accent-bar">
            <q-card-section>
                <div class="reset-eyebrow">Recuperar acceso</div>
                <div class="reset-title">Crear nueva contraseña</div>
                <div class="reset-subtitle">
                    Define una contraseña nueva para volver a entrar al sistema.
                </div>
            </q-card-section>

            <q-card-section>
                <q-form class="column q-gutter-md" @submit="resetPassword">
                    <q-input
                        v-model="form.password"
                        outlined
                        :type="showPassword ? 'text' : 'password'"
                        label="Nueva contraseña"
                        autocomplete="new-password"
                        hint="Mínimo 8 caracteres"
                        :disable="submitting"
                        :error="Boolean(errorMessage)"
                        :error-message="errorMessage"
                        :rules="passwordRules"
                    >
                        <template #prepend>
                            <q-icon name="lock_outline" />
                        </template>
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
                        :type="showConfirmation ? 'text' : 'password'"
                        label="Confirmar contraseña"
                        autocomplete="new-password"
                        :disable="submitting"
                        :rules="confirmationRules"
                    >
                        <template #prepend>
                            <q-icon name="lock_reset" />
                        </template>
                        <template #append>
                            <q-icon
                                :name="showConfirmation ? 'visibility_off' : 'visibility'"
                                class="cursor-pointer"
                                @click="showConfirmation = !showConfirmation"
                            />
                        </template>
                    </q-input>
                    <q-btn
                        unelevated
                        color="primary"
                        type="submit"
                        label="Guardar contraseña"
                        :loading="submitting"
                        class="reset-submit"
                        size="lg"
                    />
                    <q-btn flat no-caps color="primary" label="Volver al inicio de sesión" @click="goToLogin" />
                </q-form>
            </q-card-section>
        </q-card>
        <div class="reset-footer">Sistema desarrollado por <strong>DoubLe Team</strong> · © 2026 Todos los derechos reservados.</div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

defineOptions({
    name: 'ResetPasswordPage'
})

const route = useRoute()
const router = useRouter()
const submitting = ref(false)
const showPassword = ref(false)
const showConfirmation = ref(false)
const errorMessage = ref('')

const form = reactive({
    password: '',
    password_confirmation: ''
})

const passwordRules = [
    (value) => Boolean(value) || 'La contraseña es obligatoria',
    (value) => String(value || '').length >= 8 || 'Debe tener al menos 8 caracteres'
]

const confirmationRules = [
    (value) => Boolean(value) || 'Confirma la contraseña',
    (value) => value === form.password || 'Las contraseñas no coinciden'
]

function goToLogin() {
    router.replace({ name: 'Login' })
}

async function resetPassword() {
    errorMessage.value = ''

    if (!route.query.token || !route.query.email) {
        errorMessage.value = 'El enlace de recuperación está incompleto.'
        return
    }

    submitting.value = true

    try {
        const { data } = await api.post('/auth/reset-password', {
            token: route.query.token,
            email: route.query.email,
            password: form.password,
            password_confirmation: form.password_confirmation
        }, {
            skipAuthRedirect: true,
            skipEmpresaHeader: true
        })

        Notify.create({
            type: 'positive',
            message: data.message || 'Contraseña actualizada correctamente.'
        })
        await router.replace({ name: 'Login' })
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'No se pudo restablecer la contraseña.'
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.reset-page {
    min-height: 100vh;
    background: var(--app-auth-bg);
}

.reset-card {
    width: min(480px, 100%);
    border-radius: 24px;
    padding: 1rem 0.5rem;
    background: var(--app-surface);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28) !important;
    animation: fadeRise 0.5s ease both;
}

.reset-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--app-primary);
    margin-bottom: 0.35rem;
}

.reset-title {
    font-family: var(--app-font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--app-ink);
    letter-spacing: -0.02em;
}

.reset-subtitle {
    margin-top: 0.4rem;
    font-size: 0.92rem;
    color: var(--app-ink-muted);
}

.reset-submit {
    min-height: 50px;
    font-weight: 700;
    border-radius: 14px;
}

.reset-footer {
    margin-top: 1.25rem;
    text-align: center;
    font-size: 11px;
    color: rgba(236, 253, 245, 0.55);
    letter-spacing: 0.04em;
}
</style>
