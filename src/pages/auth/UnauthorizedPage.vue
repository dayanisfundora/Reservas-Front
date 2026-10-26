<template>
    <div class="unauthorized-page flex column flex-center q-pa-lg">
        <q-card flat class="unauthorized-card text-center">
            <div class="icon-wrap">
                <q-icon name="lock_person" size="48px" color="primary" />
            </div>
            <div class="unauth-title">Acceso restringido</div>
            <p class="unauth-text">
                Tu sesión está activa, pero no tienes los permisos necesarios para abrir esta vista.
            </p>
            <div class="row justify-center q-gutter-sm">
                <q-btn
                    v-if="homeRouteName !== 'Unauthorized'"
                    unelevated
                    color="primary"
                    label="Ir al inicio"
                    :to="{ name: homeRouteName }"
                />
                <q-btn flat color="primary" label="Cerrar sesión" @click="handleLogout" />
            </div>
        </q-card>
        <div class="auth-footer">© 2026 DoubLe Team | Todos los derechos reservados.</div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'

defineOptions({
    name: 'UnauthorizedPage'
})

const router = useRouter()
const authStore = useAuthStore()
const homeRouteName = computed(() => authStore.firstAccessibleRouteName())

/**
 * Clear the current session from the unauthorized screen.
 *
 * @returns {Promise<void>}
 */
async function handleLogout() {
    await authStore.logout()
    await router.replace({ name: 'Login' })
}
</script>

<style scoped>
.unauthorized-page {
    min-height: 100vh;
    background: var(--app-auth-bg);
}

.unauthorized-card {
    width: min(520px, 100%);
    border-radius: 24px;
    background: var(--app-surface);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28) !important;
    padding: 2.5rem 2rem;
    animation: fadeRise 0.45s ease both;
}

.icon-wrap {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-soft);
}

.unauth-title {
    margin-top: 1.25rem;
    font-family: var(--app-font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--app-ink);
}

.unauth-text {
    margin: 0.75rem auto 1.5rem;
    max-width: 26rem;
    color: var(--app-ink-muted);
    line-height: 1.55;
}

.auth-footer {
    margin-top: 1.1rem;
    text-align: center;
    font-size: 11px;
    color: rgba(236, 253, 245, 0.55);
    letter-spacing: 0.04em;
}
</style>
