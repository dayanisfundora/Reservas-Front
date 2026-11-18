<template>
    <AuthScene centered>
        <section class="reset-card lux-card lux-card--stripe lux-enter">
            <header class="reset-head">
                <div class="reset-icon" aria-hidden="true">
                    <q-icon name="key" size="22px" />
                </div>
                <div class="lux-label">Recuperar acceso</div>
                <h1 class="lux-title">Una llave <em>nueva</em></h1>
                <p class="lux-text">Define una contraseña nueva para volver a entrar al sistema.</p>
            </header>

            <q-form class="reset-form" @submit="resetPassword">
                <q-input
                    v-model="form.password"
                    dark
                    :type="showPassword ? 'text' : 'password'"
                    label="Nueva contraseña"
                    autocomplete="new-password"
                    hint="Mínimo 8 caracteres"
                    class="lux-field"
                    :disable="submitting"
                    :error="Boolean(errorMessage)"
                    :error-message="errorMessage"
                    :rules="passwordRules"
                >
                    <template #prepend>
                        <q-icon name="lock_outline" size="20px" />
                    </template>
                    <template #append>
                        <q-icon
                            :name="showPassword ? 'visibility_off' : 'visibility'"
                            size="20px"
                            class="cursor-pointer"
                            @click="showPassword = !showPassword"
                        />
                    </template>
                </q-input>
                <q-input
                    v-model="form.password_confirmation"
                    dark
                    :type="showConfirmation ? 'text' : 'password'"
                    label="Confirmar contraseña"
                    autocomplete="new-password"
                    class="lux-field"
                    :disable="submitting"
                    :rules="confirmationRules"
                >
                    <template #prepend>
                        <q-icon name="lock_reset" size="20px" />
                    </template>
                    <template #append>
                        <q-icon
                            :name="showConfirmation ? 'visibility_off' : 'visibility'"
                            size="20px"
                            class="cursor-pointer"
                            @click="showConfirmation = !showConfirmation"
                        />
                    </template>
                </q-input>

                <q-btn
                    unelevated
                    no-caps
                    type="submit"
                    :loading="submitting"
                    class="lux-btn full-width reset-submit"
                >
                    <span>Guardar contraseña</span>
                    <q-icon name="check" size="18px" class="q-ml-sm" />
                </q-btn>
            </q-form>

            <div class="text-center q-mt-md">
                <button type="button" class="lux-link" @click="goToLogin">Volver al inicio de sesión</button>
            </div>
        </section>
    </AuthScene>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import AuthScene from 'src/components/brand/AuthScene.vue'

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
.reset-card {
    width: min(460px, 100%);
    padding: 2rem 2rem 2.6rem;
}

.reset-head {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    margin-bottom: 1rem;
}

.reset-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 0.4rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--theme-ink);
    background: linear-gradient(135deg, var(--theme-gold-pale), var(--lx-gold) 45%, var(--theme-gold));
    box-shadow: 0 0 0 4px rgba(var(--lx-gold-rgb), 0.14), 0 10px 24px rgba(0, 0, 0, 0.35);
}

.reset-form {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.reset-submit {
    margin-top: 1.1rem;
}

@media (max-width: 520px) {
    .reset-card {
        padding: 1.5rem 1.25rem 2.3rem;
    }
}
</style>
