<template>
    <AuthScene>
        <div class="login-stage">
            <section class="login-hero">
                <p class="hero-eyebrow">
                    <span class="hero-rule" />
                    Bienvenido a casa
                </p>
                <h1 class="hero-title">
                    Cada estancia,
                    <em>una experiencia.</em>
                </h1>
                <p class="hero-text">
                    Reservas, disponibilidad y calendario de tus casas y habitaciones, con la elegancia que merece tu hospedaje.
                </p>
                <ul class="hero-features">
                    <li>Reservas</li>
                    <li>Disponibilidad</li>
                    <li>Calendario</li>
                </ul>
            </section>

            <section class="keycard-wrap">
                <div class="keycard-shadow" aria-hidden="true" />
                <div class="keycard-back" aria-hidden="true">
                    <span class="keycard-back-mark">{{ brandInitial }}</span>
                </div>

                <div class="keycard lux-card lux-card--stripe">
                    <div class="keycard-sheen" aria-hidden="true" />

                    <div class="keycard-head">
                        <div class="keycard-chip" aria-hidden="true">
                            <span /><span /><span />
                        </div>
                        <div class="keycard-meta">
                            <span class="lux-label">Suite de acceso</span>
                            <span class="keycard-number">Nº {{ cardNumber }}</span>
                        </div>
                    </div>

                    <h2 class="lux-title keycard-title">Iniciar sesión</h2>

                    <q-form class="keycard-form" @submit="submitLogin">
                        <q-input
                            v-model="loginForm.name"
                            dark
                            type="text"
                            label="Usuario o correo"
                            autocomplete="username"
                            class="lux-field"
                            :disable="submitting"
                            lazy-rules
                            :rules="usernameRules"
                        >
                            <template #prepend>
                                <q-icon name="person_outline" size="20px" />
                            </template>
                        </q-input>

                        <q-input
                            v-model="loginForm.password"
                            dark
                            :type="showPassword ? 'text' : 'password'"
                            label="Contraseña"
                            autocomplete="current-password"
                            class="lux-field"
                            :disable="submitting"
                            lazy-rules
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

                        <q-btn
                            unelevated
                            no-caps
                            type="submit"
                            :loading="submitting"
                            class="lux-btn keycard-submit full-width"
                        >
                            <span>Abrir puerta</span>
                            <q-icon name="vpn_key" size="18px" class="q-ml-sm" />
                        </q-btn>
                    </q-form>

                    <div class="text-center q-mt-md">
                        <button type="button" class="lux-link" @click="forgotOpen = true">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <q-dialog v-model="forgotOpen" persistent>
            <q-card class="lux-dialog no-accent-bar">
                <q-card-section>
                    <div class="lux-label">Recuperar acceso</div>
                    <div class="lux-title forgot-title">Olvidé mi contraseña</div>
                    <div class="lux-text q-mt-sm">
                        Escribe el correo asociado a tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
                    </div>
                </q-card-section>
                <q-card-section>
                    <q-form class="q-gutter-md" @submit="requestPasswordReset">
                        <q-input
                            v-model="forgotEmail"
                            dark
                            autofocus
                            type="email"
                            label="Correo electrónico"
                            autocomplete="email"
                            class="lux-field"
                            :disable="forgotSubmitting"
                            :rules="emailRules"
                        >
                            <template #prepend>
                                <q-icon name="mail_outline" size="20px" />
                            </template>
                        </q-input>
                        <div class="row justify-end q-gutter-sm">
                            <q-btn flat no-caps label="Cancelar" class="lux-btn-ghost" v-close-popup />
                            <q-btn
                                unelevated
                                no-caps
                                type="submit"
                                label="Enviar enlace"
                                class="lux-btn lux-btn--compact"
                                :loading="forgotSubmitting"
                            />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </AuthScene>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import AuthScene from 'src/components/brand/AuthScene.vue'
import { useBrandStore } from 'src/stores/brand-store'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth-store'
import { useEmpresaStore } from 'src/stores/empresa-store'

defineOptions({
    name: 'LoginPage'
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const brandStore = useBrandStore()
const submitting = ref(false)
const forgotOpen = ref(false)
const forgotSubmitting = ref(false)
const forgotEmail = ref('')
const showPassword = ref(false)
const loginForm = reactive({
    name: '',
    password: ''
})

const brandInitial = computed(() => (String(brandStore.name || 'R').trim().charAt(0) || 'R').toUpperCase())
const cardNumber = String(new Date().getFullYear()).padStart(4, '0')

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
.login-stage {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
    gap: clamp(2rem, 6vw, 6rem);
    align-items: center;
}

/* ---------- Hero editorial ---------- */
.login-hero {
    max-width: 36rem;
    animation: lx-rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s both;
}

.hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin: 0 0 1.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--lx-gold);
}

.hero-rule {
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--lx-gold));
}

.hero-title {
    margin: 0;
    font-family: var(--app-font-display, 'Playfair Display'), Georgia, serif;
    font-size: clamp(2.5rem, 5.4vw, 4.6rem);
    line-height: 1.02;
    font-weight: 500;
    letter-spacing: -0.025em;
    color: #fff;
    text-shadow: 0 6px 40px rgba(0, 0, 0, 0.45);
}

.hero-title em {
    display: block;
    font-style: italic;
    font-weight: 400;
    background: linear-gradient(100deg,
        var(--theme-gold-pale, #efe0bf) 0%,
        var(--lx-gold) 35%,
        var(--theme-gold, #b8893b) 60%,
        var(--theme-gold-pale, #efe0bf) 100%);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: foil 7s ease-in-out infinite alternate;
}

.hero-text {
    margin: 1.6rem 0 0;
    max-width: 29rem;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--lx-muted);
}

.hero-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.4rem;
    margin: 2rem 0 0;
    padding: 0;
    list-style: none;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(247, 239, 227, 0.82);
}

.hero-features li {
    display: inline-flex;
    align-items: center;
    gap: 1.4rem;
}

.hero-features li + li::before {
    content: '';
    width: 5px;
    height: 5px;
    background: var(--lx-gold);
    transform: rotate(45deg);
}

/* ---------- Llave-tarjeta ---------- */
.keycard-wrap {
    position: relative;
    width: 100%;
    animation: lx-card-in 1s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s both;
}

.keycard-shadow {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: -28px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    filter: blur(24px);
}

.keycard-back {
    position: absolute;
    inset: 0;
    border-radius: 26px;
    transform: rotate(7deg) translate(18px, -10px);
    background:
        linear-gradient(135deg,
            var(--theme-gold-pale, #efe0bf) 0%,
            var(--lx-gold) 28%,
            var(--theme-gold, #b8893b) 55%,
            var(--lx-gold) 78%,
            var(--theme-gold-pale, #efe0bf) 100%);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.keycard-back::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 9px);
}

.keycard-back-mark {
    position: absolute;
    right: 22px;
    top: 10px;
    font-family: var(--app-font-display, 'Playfair Display'), Georgia, serif;
    font-style: italic;
    font-size: 4.5rem;
    line-height: 1;
    color: rgba(var(--theme-ink-rgb, 42, 20, 24), 0.35);
}

.keycard-wrap:hover .keycard-back {
    transform: rotate(10deg) translate(28px, -16px);
}

.keycard-sheen {
    position: absolute;
    top: -60%;
    left: -60%;
    width: 60%;
    height: 220%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
    transform: rotate(20deg);
    animation: sheen 9s ease-in-out 1.4s infinite;
    pointer-events: none;
}

.keycard-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.6rem;
}

.keycard-chip {
    position: relative;
    width: 46px;
    height: 34px;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--theme-gold-pale, #efe0bf), var(--lx-gold) 45%, var(--theme-gold, #b8893b));
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 0 7px;
}

.keycard-chip span {
    display: block;
    height: 1px;
    background: rgba(var(--theme-ink-rgb, 42, 20, 24), 0.45);
}

.keycard-chip::after {
    content: '';
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 50%;
    width: 1px;
    background: rgba(var(--theme-ink-rgb, 42, 20, 24), 0.45);
}

.keycard-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
}

.keycard-number {
    font-family: var(--app-font-display, 'Playfair Display'), Georgia, serif;
    font-style: italic;
    font-size: 0.95rem;
    color: rgba(247, 239, 227, 0.7);
}

.keycard-title {
    margin-bottom: 1.1rem;
}

.keycard-form {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.keycard-submit {
    margin-top: 1.1rem;
}

.forgot-title {
    margin-top: 0.35rem;
    font-size: 1.5rem;
}

@keyframes foil {
    from { background-position: 0% 0; }
    to { background-position: 100% 0; }
}

@keyframes sheen {
    0%, 70% { left: -60%; }
    100% { left: 130%; }
}

@media (prefers-reduced-motion: reduce) {
    .keycard-sheen,
    .hero-title em {
        animation: none;
    }
}

@media (max-width: 960px) {
    .login-stage {
        grid-template-columns: 1fr;
        max-width: 440px;
        margin: 0 auto;
        gap: 2.5rem;
        padding-top: 2rem;
    }

    .login-hero {
        text-align: center;
        max-width: none;
    }

    .hero-eyebrow,
    .hero-features {
        justify-content: center;
    }

    .hero-text {
        margin-left: auto;
        margin-right: auto;
    }

    .hero-title {
        font-size: clamp(2.2rem, 9vw, 3.2rem);
    }
}

@media (max-width: 520px) {
    .hero-text,
    .hero-features {
        display: none;
    }

    .keycard-back {
        transform: rotate(4deg) translate(8px, -6px);
    }

    .keycard {
        padding: 1.4rem 1.3rem 2.2rem;
    }
}
</style>

