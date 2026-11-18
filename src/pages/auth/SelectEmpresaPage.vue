<template>
    <AuthScene centered>
        <section class="select-card lux-card lux-card--stripe lux-enter">
            <header class="select-head">
                <div class="lux-label">Hola, {{ authStore.userName }}</div>
                <h1 class="lux-title select-title">¿Dónde trabajamos <em>hoy</em>?</h1>
                <p class="lux-text">Elige la empresa con la que vas a trabajar en esta sesión.</p>
            </header>

            <div class="lux-rule select-rule"><span class="lux-diamond" /></div>

            <div v-if="empresaStore.empresas.length === 0" class="select-empty">
                <q-icon name="domain_disabled" size="28px" />
                <p class="lux-text">
                    Tu usuario no tiene empresas asignadas. Un administrador debe crear la empresa y vincularla a tu cuenta.
                </p>
            </div>

            <div v-else class="empresa-list">
                <button
                    v-for="(empresa, index) in empresaStore.empresas"
                    :key="empresa.id"
                    type="button"
                    class="empresa-item"
                    :style="{ animationDelay: `${0.35 + index * 0.07}s` }"
                    :disabled="selectingId !== null"
                    @click="selectEmpresa(empresa.id)"
                >
                    <span class="empresa-monogram">{{ initialOf(empresa) }}</span>
                    <span class="empresa-meta">
                        <span class="empresa-name">{{ empresa.nombre }}</span>
                        <span v-if="empresa.nombre_corto" class="empresa-caption">{{ empresa.nombre_corto }}</span>
                    </span>
                    <q-spinner v-if="selectingId === empresa.id" size="20px" class="empresa-arrow" />
                    <q-icon v-else name="arrow_forward" class="empresa-arrow" size="20px" />
                </button>
            </div>

            <div class="select-foot">
                <button type="button" class="lux-link" @click="handleLogout">
                    <q-icon name="logout" size="15px" class="q-mr-xs" />
                    Cerrar sesión
                </button>
            </div>
        </section>
    </AuthScene>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthScene from 'src/components/brand/AuthScene.vue'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useProyectoStore } from 'src/stores/proyecto-store'

defineOptions({
    name: 'SelectEmpresaPage'
})

const router = useRouter()
const route = useRoute()
const empresaStore = useEmpresaStore()
const authStore = useAuthStore()
const proyectoStore = useProyectoStore()
const selectingId = ref(null)

function initialOf(empresa) {
    return String(empresa.nombre_corto || empresa.nombre || '?').trim().charAt(0).toUpperCase()
}

async function selectEmpresa(empresaId) {
    selectingId.value = empresaId

    try {
        empresaStore.setEmpresaActiva(empresaId)
        proyectoStore.clearContext()
        authStore.persistSession()
        await proyectoStore.refreshCatalog()

        await router.replace(route.query.redirect || { name: authStore.firstAccessibleRouteName() })
    } finally {
        selectingId.value = null
    }
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
.select-card {
    width: min(540px, 100%);
    padding: 2rem 2rem 2.6rem;
}

.select-head {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.select-title {
    font-size: clamp(1.7rem, 3vw, 2.2rem);
}

.select-rule {
    margin: 1.4rem 0 1.2rem;
}

.select-empty {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 1rem 1.1rem;
    border-radius: 16px;
    border: 1px dashed rgba(var(--lx-gold-rgb), 0.4);
    color: var(--lx-gold);
}

.empresa-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-height: min(46vh, 420px);
    overflow-y: auto;
    padding-right: 2px;
}

.empresa-item {
    display: flex;
    align-items: center;
    gap: 0.95rem;
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 0.8rem;
    border-radius: 16px;
    border: 1px solid rgba(var(--lx-gold-rgb), 0.18);
    background: rgba(255, 255, 255, 0.03);
    color: inherit;
    cursor: pointer;
    text-align: left;
    font: inherit;
    animation: lx-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.empresa-item:hover:not(:disabled),
.empresa-item:focus-visible {
    outline: none;
    transform: translateX(4px);
    border-color: rgba(var(--lx-gold-rgb), 0.6);
    background: linear-gradient(90deg, rgba(var(--lx-gold-rgb), 0.12), rgba(var(--theme-wine-rgb), 0.18));
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.empresa-item:disabled {
    cursor: progress;
    opacity: 0.7;
}

.empresa-monogram {
    flex: 0 0 46px;
    width: 46px;
    height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-family: var(--app-font-display), Georgia, serif;
    font-style: italic;
    font-size: 1.35rem;
    color: var(--lx-gold);
    background: radial-gradient(circle at 30% 30%, rgba(var(--theme-wine-rgb), 0.9), var(--theme-ink));
    border: 1px solid rgba(var(--lx-gold-rgb), 0.55);
    box-shadow: 0 0 0 3px rgba(var(--lx-gold-rgb), 0.08);
}

.empresa-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.empresa-name {
    font-weight: 600;
    font-size: 1rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.empresa-caption {
    margin-top: 2px;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(247, 239, 227, 0.55);
}

.empresa-arrow {
    color: rgba(var(--lx-gold-rgb), 0.55);
    transition: transform 0.25s ease, color 0.25s ease;
}

.empresa-item:hover .empresa-arrow {
    color: var(--lx-gold);
    transform: translateX(3px);
}

.select-foot {
    margin-top: 1.4rem;
    text-align: center;
}

.select-foot .lux-link {
    display: inline-flex;
    align-items: center;
}

@media (max-width: 520px) {
    .select-card {
        padding: 1.5rem 1.25rem 2.3rem;
    }
}
</style>
