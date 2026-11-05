<template>
    <q-layout view="lHh Lpr lFr" id="mainLayout" class="app-layout">
        <q-header class="app-header" bordered>
            <q-toolbar class="app-toolbar">
                <div class="h row items-center header-brand">
                    <q-btn
                        size="sm"
                        class="menu-toggle"
                        flat
                        @click="toggleMini"
                        round
                        dense
                        icon="menu"
                    >
                        <q-tooltip>{{ miniState ? "Expandir Menú" : "Colapsar Menú" }}</q-tooltip>
                    </q-btn>
                    <div class="brand-block">
                        <div class="brand-mark" aria-hidden="true" />
                        <q-toolbar-title class="brand-title" shrink>
                            <span class="brand-title-full">SISTEMA DE GESTIÓN DE RESERVAS</span>
                            <span class="brand-title-short">RESERVAS</span>
                        </q-toolbar-title>
                    </div>
                </div>

                <q-space />

                <div class="row items-center q-gutter-sm header-actions">
                    <q-select
                        v-if="empresaStore.empresas.length > 1"
                        dense
                        outlined
                        emit-value
                        map-options
                        class="header-select"
                        popup-content-class="header-select-menu"
                        :model-value="empresaStore.empresaActivaId"
                        :options="empresaOptions"
                        label="Empresa"
                        @update:model-value="handleEmpresaChange"
                    />
                    <q-select
                        v-if="proyectoStore.casas.length > 0"
                        dense
                        outlined
                        emit-value
                        map-options
                        clearable
                        options-dense
                        class="header-select header-select--casa"
                        popup-content-class="header-select-menu"
                        :model-value="proyectoStore.casaActivaId"
                        :options="casaFilterOptions"
                        label="Casa"
                        @update:model-value="handleCasaChange"
                    />
                    <q-btn
                        v-if="canSeeNotificaciones"
                        flat
                        round
                        dense
                        class="notif-bell"
                        icon="notifications"
                        @click="notificacionesStore.toggleDrawer()"
                    >
                        <q-badge
                            v-if="notificacionesStore.badgeCount"
                            color="negative"
                            floating
                            rounded
                        >
                            {{ notificacionesStore.badgeCount > 99 ? '99+' : notificacionesStore.badgeCount }}
                        </q-badge>
                        <q-tooltip>Llegadas próximas</q-tooltip>
                    </q-btn>

                    <q-btn
                        flat
                        round
                        dense
                        class="theme-toggle gt-xs"
                        :icon="themeStore.dark ? 'light_mode' : 'dark_mode'"
                        @click="themeStore.toggle()"
                    >
                        <q-tooltip>{{ themeStore.dark ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
                    </q-btn>

                    <div class="row items-center cursor-pointer user-chip">
                        <div class="column items-end q-mr-sm user-meta" style="line-height:1;">
                            <span class="user-name">{{ authStore.userName }}</span>
                        </div>
                        <q-avatar size="32px" color="primary" text-color="white" icon="person" class="user-avatar" />
                        <q-menu auto-close>
                            <q-list style="min-width: 180px" class="user-menu">
                                <q-item clickable @click="themeStore.toggle()">
                                    <q-item-section avatar>
                                        <q-icon :name="themeStore.dark ? 'light_mode' : 'dark_mode'" color="primary" />
                                    </q-item-section>
                                    <q-item-section>
                                        {{ themeStore.dark ? 'Modo claro' : 'Modo oscuro' }}
                                    </q-item-section>
                                </q-item>
                                <q-item clickable :to="{ name: 'EditarPerfil' }">
                                    <q-item-section avatar>
                                        <q-icon name="manage_accounts" color="primary" />
                                    </q-item-section>
                                    <q-item-section>Editar perfil</q-item-section>
                                </q-item>
                                <q-separator />
                                <q-item clickable @click="handleLogout">
                                    <q-item-section avatar>
                                        <q-icon name="logout" color="negative" />
                                    </q-item-section>
                                    <q-item-section class="text-negative">Cerrar sesión</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </div>
                </div>
            </q-toolbar>
        </q-header>
        <q-drawer
            v-model="drawer"
            show-if-above
            :mini="miniState"
            :mini-width="64"
                        :width="drawerWidth"
                        :breakpoint="1024"
            class="app-drawer"
            bordered
        >
            <div class="drawer-body column no-wrap full-height">
                <div class="drawer-bg" aria-hidden="true" />
                <div class="drawer-scroll col" :class="miniState ? 'q-pa-xs' : 'q-pa-sm'">
                    <div class="drawer-top" v-if="!miniState">
                        <div class="drawer-label">Navegación</div>
                    </div>
                    <q-list padding class="menu-list">
                        <EssentialLink :mini="miniState" />
                    </q-list>
                </div>
            </div>
        </q-drawer>
        <q-page-container class="page-container">
            <router-view />
        </q-page-container>

        <NotificacionesDrawer v-if="canSeeNotificaciones" />
    </q-layout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import EssentialLink from 'src/components/EssentialLink.vue'
import NotificacionesDrawer from 'src/components/notificaciones/NotificacionesDrawer.vue'
import { useAuthStore } from 'src/stores/auth-store'
import { useEmpresaStore } from 'src/stores/empresa-store'
import { useNotificacionesStore } from 'src/stores/notificaciones-store'
import { useProyectoStore } from 'src/stores/proyecto-store'
import { useThemeStore } from 'src/stores/theme-store'
import { useProyectoContext } from 'src/composables/useProyectoContext'


defineOptions({
    name: 'MainLayout'
})

const $q = useQuasar()
const drawer = ref(true)
const miniState = ref(true)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const proyectoStore = useProyectoStore()
const themeStore = useThemeStore()
const notificacionesStore = useNotificacionesStore()
const { casaFilterOptions } = useProyectoContext()

const canSeeNotificaciones = computed(() => authStore.hasPermission('ver_reservas'))

/** Más estrecho en laptops para ganar área de contenido */
const drawerWidth = computed(() => ($q.screen.width < 1440 ? 252 : 288))

const empresaOptions = computed(() => {
    return empresaStore.empresas.map((empresa) => ({
        label: empresa.nombre_corto || empresa.nombre,
        value: empresa.id
    }))
})

/** Páginas anchas (p. ej. el calendario) piden el menú en su forma reducida */
const wantsCompactDrawer = computed(() => route.meta?.compactDrawer === true)
const miniBeforeCompact = ref(null)

function toggleMini() {
    miniState.value = !miniState.value
}

watch(
    wantsCompactDrawer,
    (compact) => {
        if (compact) {
            if (miniBeforeCompact.value === null) {
                miniBeforeCompact.value = miniState.value
            }
            miniState.value = true
            return
        }

        if (miniBeforeCompact.value !== null) {
            miniState.value = miniBeforeCompact.value
            miniBeforeCompact.value = null
        }
    },
    { immediate: true }
)

async function handleEmpresaChange(empresaId) {
    empresaStore.setEmpresaActiva(empresaId)
    proyectoStore.setCasaActiva(null)
    authStore.persistSession()
    await router.replace({ path: route.fullPath, force: true })
    window.location.reload()
}

function handleCasaChange(casaId) {
    proyectoStore.setCasaActiva(casaId)
    authStore.persistSession()
    window.location.reload()
}

watch(
    () => proyectoStore.casaActivaId,
    () => {
        if (canSeeNotificaciones.value) notificacionesStore.refresh()
    }
)

onMounted(async () => {
    if (authStore.token && empresaStore.empresaActivaId && !proyectoStore.initialized) {
        try {
            await proyectoStore.refreshCatalog()
        } catch {
            // Pages can retry catalog loading if needed.
        }
    }
    if (canSeeNotificaciones.value) {
        notificacionesStore.startPolling()
    }
})

onBeforeUnmount(() => {
    notificacionesStore.stopPolling()
})

/**
 * Close the current user session and redirect to login.
 *
 * @returns {Promise<void>}
 */
async function handleLogout() {
    notificacionesStore.stopPolling()
    notificacionesStore.closeDrawer()
    await authStore.logout()
    await router.replace({ name: 'Login' })
}

</script>

<style scoped>
.app-layout {
    background: var(--app-page-bg);
    background-attachment: fixed;
}

.app-header {
    min-height: 58px;
    background: var(--app-shell-bg-header) !important;
    backdrop-filter: blur(12px) saturate(140%);
    box-shadow: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
    color: var(--app-shell-ink) !important;
}

.app-header :deep(.q-toolbar),
.app-toolbar {
    min-height: 58px;
    height: 58px;
    padding: 0 clamp(10px, 1.2vw, 16px);
    color: var(--app-shell-ink) !important;
    flex-wrap: nowrap !important;
    gap: 8px;
    overflow: hidden;
}

.menu-toggle {
    margin-right: 8px;
    color: var(--app-shell-accent) !important;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.brand-mark {
    width: 10px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #99f6e4 0%, #5eead4 45%, #14b8a6 100%);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
}

.brand-title {
    padding: 0;
    font-size: 13px !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em;
    color: var(--app-shell-ink) !important;
    line-height: 1.25;
    max-width: min(420px, 36vw);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: none;
}

.brand-title-short {
    display: none;
}

.header-actions {
    flex-wrap: nowrap !important;
    flex-shrink: 1;
    min-width: 0;
    align-items: center;
}

.header-select {
    min-width: 140px;
    max-width: 190px;
    width: clamp(130px, 14vw, 190px);
    flex-shrink: 1;
}

.header-select--casa {
    min-width: 220px;
    width: 220px;
    max-width: 240px;
    flex-shrink: 0;
}

.header-select :deep(.q-field__control) {
    background: var(--app-shell-control-bg) !important;
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
}

.header-select :deep(.q-field__native),
.header-select :deep(.q-field__input) {
    color: var(--app-shell-control-ink) !important;
    font-weight: 600;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    flex-wrap: nowrap !important;
    line-height: 1.2 !important;
}

.header-select :deep(.q-field__control-container) {
    flex-wrap: nowrap !important;
    overflow: hidden !important;
}

.header-select :deep(.q-field__marginal),
.header-select :deep(.q-select__dropdown-icon) {
    color: var(--app-primary) !important;
    font-weight: 600;
}

.header-select :deep(.q-field__label) {
    color: var(--app-ink-muted) !important;
    white-space: nowrap !important;
}

.header-select :deep(.q-field--outlined .q-field__control::before) {
    border-color: var(--app-shell-control-border) !important;
}

.theme-toggle,
.notif-bell {
    color: var(--app-primary) !important;
    background: var(--app-shell-control-bg);
    border: 1px solid var(--app-shell-control-border);
}

.theme-toggle:hover,
.notif-bell:hover {
    border-color: rgba(15, 118, 110, 0.35);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.notif-bell :deep(.q-badge) {
    font-size: 10px;
    padding: 2px 5px;
    min-height: 16px;
}

.user-chip {
    padding: 4px 6px 4px 10px;
    border-radius: 999px;
    background: var(--app-shell-control-bg);
    border: 1px solid var(--app-shell-control-border);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
}

.user-chip:hover {
    border-color: rgba(15, 118, 110, 0.35);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.user-name {
    font-size: 13px;
    font-weight: 650;
    color: var(--app-shell-control-ink) !important;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-avatar {
    box-shadow: 0 4px 10px rgba(15, 118, 110, 0.25);
}

.page-container {
    padding: clamp(12px, 1.6vw, 22px) clamp(12px, 1.5vw, 20px) clamp(20px, 2.2vw, 32px);
    max-width: 100%;
    overflow-x: clip;
}

@media (min-width: 1600px) {
    .page-container {
        padding-left: clamp(16px, 1.2vw, 28px);
        padding-right: clamp(16px, 1.2vw, 28px);
    }
}

.h {
    justify-content: space-between;
    min-width: 0;
    flex-shrink: 1;
}

:deep(.q-input) .q-field__control {
    border-radius: 12px;
}

:deep(.q-drawer) {
    border-right: 1px solid rgba(255, 255, 255, 0.12) !important;
}

:deep(.q-drawer__content) {
    overflow: hidden !important;
    height: 100%;
    background: transparent !important;
}

.app-drawer {
    background: transparent !important;
}

.drawer-body {
    position: relative;
    height: 100%;
    min-height: 0;
    background: transparent;
    isolation: isolate;
}

.drawer-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: var(--app-shell-bg);
}

.drawer-top {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    padding: 8px 10px 10px;
}

.drawer-label {
    font-size: 0.7rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--app-shell-accent);
    text-shadow: none;
}

.drawer-scroll {
    position: relative;
    z-index: 1;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: #5eead4 rgba(15, 23, 42, 0.35);
}

.drawer-scroll::-webkit-scrollbar {
    width: 10px;
}

.drawer-scroll::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.28);
    border-radius: 0;
}

.drawer-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #5eead4 0%, #14b8a6 50%, #0f766e 100%);
    border-radius: 8px;
    border: 2px solid rgba(15, 23, 42, 0.28);
    min-height: 40px;
}

.drawer-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #99f6e4 0%, #5eead4 50%, #14b8a6 100%);
}

.drawer-scroll::-webkit-scrollbar-corner {
    background: transparent;
}

/* Laptops 1366 / 1440 */
@media (max-width: 1440px) {
    .brand-title {
        max-width: min(280px, 28vw);
        font-size: 12px !important;
    }

    .header-select {
        min-width: 120px;
    }

    .header-select--casa {
        min-width: 220px;
        width: 220px;
        max-width: 230px;
    }

    .user-name {
        max-width: 100px;
    }
}

@media (max-width: 1280px) {
    .brand-title-full {
        display: none;
    }

    .brand-title-short {
        display: inline;
    }

    .brand-title {
        max-width: 110px;
        font-size: 12px !important;
        letter-spacing: 0.08em;
    }

    .user-meta {
        display: none;
    }

    .header-select {
        width: 118px;
        min-width: 110px;
    }

    .header-select--casa {
        width: 210px;
        min-width: 210px;
        max-width: 220px;
    }
}

@media (max-width: 1024px) {
    .brand-title {
        display: none;
    }

    .brand-mark {
        height: 24px;
    }
}
</style>

<style>
/* Menú desplegable de los selects del header */
.header-select-menu,
.header-select-menu .q-item,
.header-select-menu .q-item__label,
.header-select-menu .q-item__section {
    color: #0f172a !important;
}

.header-select-menu .q-item__label {
    font-weight: 600 !important;
}

body.body--dark .header-select-menu,
body.body--dark .header-select-menu .q-item,
body.body--dark .header-select-menu .q-item__label,
body.body--dark .header-select-menu .q-item__section {
    color: #f1f5f9 !important;
    background: #1e293b;
}

/* Shell: claro = verde Login; oscuro = slate (se distingue) */
.app-header.q-header,
.q-header.app-header {
    background: var(--app-shell-bg-header) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
    color: var(--app-shell-ink) !important;
}

.app-header .brand-title {
    color: var(--app-shell-ink) !important;
}

.app-header .menu-toggle {
    color: var(--app-shell-accent) !important;
}

.app-header .theme-toggle,
.app-header .notif-bell {
    color: var(--app-primary) !important;
    background: var(--app-shell-control-bg) !important;
    border-color: var(--app-shell-control-border) !important;
}

.app-header .user-chip {
    background: var(--app-shell-control-bg) !important;
    border-color: var(--app-shell-control-border) !important;
}

.app-header .user-name {
    color: var(--app-shell-control-ink) !important;
}

.app-header .header-select .q-field__control {
    background: var(--app-shell-control-bg) !important;
}

.app-header .header-select .q-field__native,
.app-header .header-select .q-field__input {
    color: var(--app-shell-control-ink) !important;
}

.app-header .header-select .q-field__marginal,
.app-header .header-select .q-select__dropdown-icon {
    color: var(--app-primary) !important;
}

.app-header .header-select .q-field__label {
    color: var(--app-ink-muted) !important;
}

.app-header .header-select .q-field--outlined .q-field__control::before {
    border-color: var(--app-shell-control-border) !important;
}

.app-drawer.q-drawer,
.q-drawer.app-drawer {
    background: transparent !important;
    border-right-color: rgba(255, 255, 255, 0.12) !important;
}

.app-drawer .q-drawer__content {
    background: transparent !important;
}

.drawer-bg {
    background: var(--app-shell-bg) !important;
}

.drawer-label {
    color: var(--app-shell-accent) !important;
}

body.body--dark .drawer-scroll {
    scrollbar-color: #2dd4bf rgba(2, 6, 23, 0.55);
}

body.body--dark .drawer-scroll::-webkit-scrollbar-track {
    background: rgba(2, 6, 23, 0.55);
}

body.body--dark .drawer-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #2dd4bf 0%, #14b8a6 100%);
    border-color: rgba(2, 6, 23, 0.45);
}
</style>
