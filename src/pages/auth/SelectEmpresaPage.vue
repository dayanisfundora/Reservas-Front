<template>
    <div class="select-empresa-page flex column flex-center q-pa-lg">
        <q-btn
            flat
            round
            class="auth-theme-toggle"
            :icon="themeStore.dark ? 'light_mode' : 'dark_mode'"
            @click="themeStore.toggle()"
        >
            <q-tooltip>{{ themeStore.dark ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
        </q-btn>

        <q-card flat class="select-empresa-card no-accent-bar">
            <q-card-section class="select-header">
                <p class="select-eyebrow">Gestión de Reservas</p>
                <div class="select-title">Seleccionar empresa</div>
                <div class="select-subtitle">
                    Elija con qué empresa desea trabajar en esta sesión.
                </div>
            </q-card-section>

            <q-card-section v-if="empresaStore.empresas.length === 0" class="q-pt-none">
                <q-banner rounded class="empty-banner">
                    Su usuario no tiene empresas asignadas. Un administrador debe crear la empresa y
                    vincularla a su cuenta.
                </q-banner>
            </q-card-section>

            <q-card-section v-else class="q-pt-none">
                <div class="empresa-list">
                    <button
                        v-for="empresa in empresaStore.empresas"
                        :key="empresa.id"
                        type="button"
                        class="empresa-item"
                        @click="selectEmpresa(empresa.id)"
                    >
                        <q-avatar size="44px" color="primary" text-color="white" icon="apartment" />
                        <div class="empresa-meta">
                            <div class="empresa-name">{{ empresa.nombre }}</div>
                            <div v-if="empresa.nombre_corto" class="empresa-caption">{{ empresa.nombre_corto }}</div>
                        </div>
                        <q-icon name="arrow_forward" class="empresa-arrow" size="20px" />
                    </button>
                </div>
            </q-card-section>

            <q-card-section class="q-pt-none row justify-end">
                <q-btn flat no-caps color="primary" icon="logout" label="Cerrar sesión" @click="handleLogout" />
            </q-card-section>
        </q-card>
        <div class="select-footer">Sistema desarrollado por <strong>DoubLe Team</strong> · © 2026 Todos los derechos reservados.</div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useProyectoStore } from 'src/stores/proyecto-store'
import { useThemeStore } from 'src/stores/theme-store'

defineOptions({
    name: 'SelectEmpresaPage'
})

const router = useRouter()
const route = useRoute()
const empresaStore = useEmpresaStore()
const authStore = useAuthStore()
const proyectoStore = useProyectoStore()
const themeStore = useThemeStore()

async function selectEmpresa(empresaId) {
    empresaStore.setEmpresaActiva(empresaId)
    proyectoStore.clearContext()
    authStore.persistSession()
    await proyectoStore.refreshCatalog()

    await router.replace(route.query.redirect || { name: authStore.firstAccessibleRouteName() })
}

async function handleLogout() {
    await authStore.logout()
    await router.replace({ name: 'Login' })
}

onMounted(async () => {
    if (empresaStore.empresas.length === 0) {
        await authStore.ensureEmpresaContext()
    }
})
</script>

<style scoped>
.select-empresa-page {
    min-height: 100vh;
    background: var(--app-auth-bg);
    position: relative;
}

.select-empresa-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent 45%);
    pointer-events: none;
}

.auth-theme-toggle {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
    color: #ecfdf5;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
}

.select-empresa-card {
    position: relative;
    z-index: 1;
    width: min(560px, 100%);
    border-radius: 24px;
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28) !important;
    animation: fadeRise 0.5s ease both;
    padding: 0.5rem 0.25rem 0.25rem;
}

.select-header {
    padding-bottom: 0.5rem;
}

.select-eyebrow {
    margin: 0 0 0.4rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--app-primary);
}

.select-title {
    font-family: var(--app-font-display);
    font-size: 1.65rem;
    font-weight: 600;
    color: var(--app-ink);
    letter-spacing: -0.02em;
}

.select-subtitle {
    margin-top: 0.4rem;
    font-size: 0.92rem;
    color: var(--app-ink-muted);
    line-height: 1.45;
}

.empty-banner {
    background: var(--app-accent-soft);
    color: var(--app-accent);
    border: 1px solid rgba(217, 119, 6, 0.25);
}

.empresa-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.empresa-item {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 14px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-elevated);
    cursor: pointer;
    text-align: left;
    font-family: var(--app-font);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.empresa-item:hover {
    transform: translateY(-2px);
    border-color: rgba(15, 118, 110, 0.35);
    background: var(--app-surface);
    box-shadow: 0 10px 28px rgba(15, 118, 110, 0.12);
}

.empresa-item:hover .empresa-arrow {
    color: var(--app-primary);
    transform: translateX(3px);
}

.empresa-meta {
    flex: 1;
    min-width: 0;
}

.empresa-name {
    font-weight: 700;
    font-size: 0.98rem;
    color: var(--app-ink);
}

.empresa-caption {
    margin-top: 2px;
    font-size: 0.8rem;
    color: var(--app-ink-muted);
}

.empresa-arrow {
    color: var(--app-ink-faint);
    transition: transform 0.2s ease, color 0.2s ease;
}

.select-footer {
    position: relative;
    z-index: 1;
    margin-top: 1.1rem;
    text-align: center;
    font-size: 11px;
    color: rgba(236, 253, 245, 0.55);
    letter-spacing: 0.04em;
}
</style>
