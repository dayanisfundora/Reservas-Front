<template>
    <AuthScene centered>
        <section class="status-card lux-card lux-card--stripe lux-enter">
            <div class="status-seal" aria-hidden="true">
                <q-icon name="lock_person" size="30px" />
            </div>
            <div class="lux-label">Acceso restringido</div>
            <h1 class="lux-title status-title">Esta puerta <em>está cerrada</em></h1>
            <p class="lux-text status-text">
                Tu sesión está activa, pero no tienes los permisos necesarios para abrir esta vista.
            </p>

            <div class="lux-rule status-rule"><span class="lux-diamond" /></div>

            <div class="status-actions">
                <q-btn
                    v-if="homeRouteName !== 'Unauthorized'"
                    unelevated
                    no-caps
                    class="lux-btn lux-btn--compact"
                    label="Ir al inicio"
                    :to="{ name: homeRouteName }"
                />
                <q-btn flat no-caps class="lux-btn-ghost" label="Cerrar sesión" @click="handleLogout" />
            </div>
        </section>
    </AuthScene>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthScene from 'src/components/brand/AuthScene.vue'
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
.status-card {
    width: min(500px, 100%);
    padding: 2.4rem 2rem 2.8rem;
    text-align: center;
}

.status-seal {
    width: 72px;
    height: 72px;
    margin: 0 auto 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--lx-gold);
    background: radial-gradient(circle at 30% 30%, rgba(var(--theme-wine-rgb), 0.9), var(--theme-ink));
    border: 1px solid rgba(var(--lx-gold-rgb), 0.6);
    box-shadow: 0 0 0 6px rgba(var(--lx-gold-rgb), 0.08), 0 14px 30px rgba(0, 0, 0, 0.4);
}

.status-title {
    margin-top: 0.55rem;
    font-size: clamp(1.7rem, 3vw, 2.1rem);
}

.status-text {
    margin: 0.75rem auto 0;
    max-width: 24rem;
}

.status-rule {
    margin: 1.5rem auto 1.4rem;
    max-width: 220px;
}

.status-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
}
</style>
