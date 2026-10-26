<template>
    <div class="login-page flex column flex-center q-pa-lg">
        <q-btn
            flat
            round
            class="auth-theme-toggle"
            :icon="themeStore.dark ? 'light_mode' : 'dark_mode'"
            @click="themeStore.toggle()"
        >
            <q-tooltip>{{ themeStore.dark ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
        </q-btn>

        <div class="login-orb login-orb--one" aria-hidden="true" />
        <div class="login-orb login-orb--two" aria-hidden="true" />

        <div class="login-shell row items-stretch">
            <section class="login-copy column justify-between">
                <div>
                    <div class="login-brand">
                        <div class="login-brand-icon">
                            <q-icon name="king_bed" size="20px" />
                        </div>
                        <span class="login-brand-name">Reservas</span>
                    </div>

                    <p class="eyebrow">Gestión de alojamiento</p>
                    <h1 class="login-title">Controla la ocupación de tus casas y habitaciones en un solo lugar.</h1>
                    <p class="login-text">
                        Inicia sesión para registrar reservas, consultar la disponibilidad y planificar tus estancias.
                    </p>
                </div>

                <div class="login-points">
                    <div class="login-point">
                        <div class="login-point-icon"><q-icon name="event_available" size="16px" /></div>
                        <span>Reservas privadas y compartidas con control de disponibilidad</span>
                    </div>
                    <div class="login-point">
                        <div class="login-point-icon"><q-icon name="calendar_month" size="16px" /></div>
                        <span>Calendario visual de ocupación por habitación</span>
                    </div>
                    <div class="login-point">
                        <div class="login-point-icon"><q-icon name="picture_as_pdf" size="16px" /></div>
                        <span>Exportación del calendario a PDF</span>
                    </div>
                </div>
            </section>

            <q-card flat class="login-card no-accent-bar">
                <q-card-section class="login-card-head">
                    <div class="login-avatar">
                        <q-icon name="lock_open" size="20px" />
                    </div>
                    <div class="login-card-eyebrow">Acceso seguro</div>
                    <div class="login-card-title">Bienvenido de nuevo</div>
                    <div class="login-card-subtitle">Ingresa tus credenciales para continuar.</div>
                </q-card-section>

                <q-card-section>
                    <q-form class="column q-gutter-sm" @submit="submitLogin">
                        <q-input
                            v-model="loginForm.name"
                            outlined
                            dense
                            type="text"
                            label="Usuario o correo"
                            autocomplete="username"
                            :disable="submitting"
                            lazy-rules
                            :rules="usernameRules"
                        >
                            <template #prepend>
                                <q-icon name="person_outline" />
                            </template>
                        </q-input>

                        <q-input
                            v-model="loginForm.password"
                            outlined
                            dense
                            :type="showPassword ? 'text' : 'password'"
                            label="Contraseña"
                            autocomplete="current-password"
                            :disable="submitting"
                            lazy-rules
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

                        <q-btn
                            unelevated
                            color="primary"
                            type="submit"
                            :loading="submitting"
                            label="Entrar"
                            icon-right="arrow_forward"
                            class="login-submit"
                        />
                    </q-form>
                    <div class="forgot-password-wrap">
                        <q-btn
                            flat
                            dense
                            no-caps
                            color="primary"
                            label="¿Olvidaste tu contraseña?"
                            class="forgot-password"
                            @click="forgotOpen = true"
                        />
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <q-dialog v-model="forgotOpen">
            <q-card class="forgot-card">
                <q-card-section>
                    <div class="login-card-eyebrow">Recuperar acceso</div>
                    <div class="text-h5 text-weight-bold">Olvidé mi contraseña</div>
                    <div class="forgot-text q-mt-sm">
                        Escribe el correo asociado a tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
                    </div>
                </q-card-section>
                <q-card-section>
                    <q-form class="q-gutter-md" @submit="requestPasswordReset">
                        <q-input
                            v-model="forgotEmail"
                            outlined
                            autofocus
                            type="email"
                            label="Correo electrónico"
                            autocomplete="email"
                            :disable="forgotSubmitting"
                            :rules="emailRules"
                        >
                            <template #prepend>
                                <q-icon name="mail_outline" />
                            </template>
                        </q-input>
                        <div class="row justify-end q-gutter-sm">
                            <q-btn flat label="Cancelar" v-close-popup />
                            <q-btn
                                unelevated
                                color="primary"
                                type="submit"
                                label="Enviar enlace"
                                :loading="forgotSubmitting"
                            />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <div class="login-footer">© 2026 DoubLe Team | Todos los derechos reservados.</div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth-store'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useThemeStore } from 'src/stores/theme-store'

defineOptions({
    name: 'LoginPage'
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const themeStore = useThemeStore()
const submitting = ref(false)
const forgotOpen = ref(false)
const forgotSubmitting = ref(false)
const forgotEmail = ref('')
const showPassword = ref(false)
const loginForm = reactive({
    name: '',
    password: ''
})

const usernameRules = [
    (value) => Boolean(value) || 'El usuario es obligatorio'
]

const passwordRules = [
    (value) => Boolean(value) || 'La contraseña es obligatoria'
]

const emailRules = [
    (value) => Boolean(String(value || '').trim()) || 'El correo es obligatorio',
    (value) => /.+@.+\..+/.test(String(value || '')) || 'El correo no es válido'
]

/**
 * Submit the login form and redirect to the requested route.
 *
 * @returns {Promise<void>}
 */
async function submitLogin() {
    submitting.value = true

    try {
        await authStore.login({ ...loginForm })
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo iniciar sesión'
        })
        submitting.value = false
        return
    }

    Notify.create({
        type: 'positive',
        message: `Bienvenido, ${authStore.userName}`,
        position: 'top-right'
    })

    try {
        const destination = !empresaStore.hasEmpresaActiva
            ? {
                name: 'SelectEmpresa',
                query: route.query.redirect ? { redirect: route.query.redirect } : undefined
            }
            : (route.query.redirect || { name: authStore.firstAccessibleRouteName() })

        await router.replace(destination)
    } catch (navigationError) {
        if (!isNavigationFailure(navigationError)) {
            console.error('Error al abrir el sistema tras iniciar sesión', navigationError)
            Notify.create({
                type: 'negative',
                message: 'Sesión iniciada, pero no se pudo abrir el sistema. Recarga la página (F5).'
            })
        }
    } finally {
        submitting.value = false
    }
}

async function requestPasswordReset() {
    forgotSubmitting.value = true

    try {
        const { data } = await api.post('/auth/forgot-password', {
            email: forgotEmail.value.trim()
        }, {
            skipAuthRedirect: true,
            skipEmpresaHeader: true
        })

        forgotOpen.value = false
        Notify.create({
            type: 'positive',
            message: data.message || 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',
            timeout: 7000
        })
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo enviar la solicitud.'
        })
    } finally {
        forgotSubmitting.value = false
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background: var(--app-auth-bg);
    position: relative;
    overflow: hidden;
}

.login-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.06), transparent 40%),
        repeating-linear-gradient(
            -12deg,
            transparent,
            transparent 18px,
            rgba(255, 255, 255, 0.015) 18px,
            rgba(255, 255, 255, 0.015) 19px
        );
    pointer-events: none;
}

.login-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    animation: orbFloat 14s ease-in-out infinite alternate;
}

.login-orb--one {
    width: 420px;
    height: 420px;
    top: -120px;
    left: -100px;
    background: rgba(45, 212, 191, 0.28);
}

.login-orb--two {
    width: 360px;
    height: 360px;
    bottom: -120px;
    right: -80px;
    background: rgba(217, 119, 6, 0.18);
    animation-delay: -6s;
}

@keyframes orbFloat {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(40px, 30px, 0) scale(1.08); }
}

.auth-theme-toggle {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
    color: #ecfdf5;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(8px);
}

.auth-theme-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
}

.login-shell {
    position: relative;
    z-index: 1;
    width: min(860px, 100%);
    border-radius: 24px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    animation: fadeRise 0.55s ease both;
}

.login-copy {
    flex: 1 1 52%;
    padding: 2rem 2.25rem;
    color: #ecfdf5;
    background:
        linear-gradient(160deg, rgba(15, 118, 110, 0.45), rgba(15, 23, 42, 0.35)),
        rgba(15, 23, 42, 0.25);
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1.4rem;
}

.login-brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    background: linear-gradient(135deg, #99f6e4 0%, #5eead4 45%, #14b8a6 100%);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.login-brand-name {
    font-family: var(--app-font-display);
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #fff;
}

.eyebrow {
    margin: 0 0 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: 0.68rem;
    font-weight: 700;
    color: #5eead4;
}

.login-title {
    margin: 0;
    font-family: var(--app-font-display);
    font-size: clamp(1.3rem, 2.2vw, 1.75rem);
    line-height: 1.15;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #fff;
}

.login-text {
    max-width: 30rem;
    margin-top: 0.85rem;
    font-size: 0.86rem;
    line-height: 1.6;
    color: rgba(236, 253, 245, 0.82);
}

.login-points {
    display: grid;
    gap: 0.55rem;
    margin-top: 1.25rem;
}

.login-point {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.55rem 0.8rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 0.8rem;
    font-weight: 500;
    transition: background 0.2s ease, transform 0.2s ease;
}

.login-point:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateX(4px);
}

.login-point-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5eead4;
    background: rgba(15, 23, 42, 0.35);
}

.login-card {
    flex: 1 1 48%;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--app-surface);
    border-radius: 0;
    border: none;
    box-shadow: none !important;
}

.login-card-head {
    padding-bottom: 0.25rem;
}

.login-avatar {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    margin-bottom: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--app-primary);
    background: var(--app-primary-soft);
    border: 1px solid var(--app-border);
}

.login-card-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--app-primary);
    margin-bottom: 0.35rem;
}

.login-card-title {
    font-family: var(--app-font-display);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--app-ink);
    letter-spacing: -0.02em;
}

.login-card-subtitle {
    margin-top: 0.25rem;
    font-size: 0.82rem;
    color: var(--app-ink-muted);
}

.login-submit {
    margin-top: 0.25rem;
    min-height: 42px;
    font-weight: 700;
    border-radius: 12px;
    box-shadow: 0 12px 26px var(--app-primary-glow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 32px var(--app-primary-glow);
}

.forgot-password-wrap {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
}

.forgot-password {
    font-weight: 650;
}

.forgot-card {
    width: min(440px, 92vw);
}

.forgot-text {
    font-size: 0.9rem;
    color: var(--app-ink-muted);
}

.login-footer {
    position: relative;
    z-index: 1;
    margin-top: 1.25rem;
    text-align: center;
    font-family: var(--app-font);
    font-size: 11px;
    color: rgba(236, 253, 245, 0.55);
    letter-spacing: 0.04em;
}

@media (max-width: 840px) {
    .login-shell {
        flex-direction: column;
    }

    .login-copy,
    .login-card {
        padding: 1.5rem;
    }

    .login-brand {
        margin-bottom: 1.25rem;
    }

    .login-points {
        display: none;
    }
}
</style>
