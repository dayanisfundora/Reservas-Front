<template>
    <div class="auth-scene" :class="{ 'auth-scene--centered': centered }">
        <div class="auth-scene-bg" aria-hidden="true">
            <div class="auth-scene-photo" />
            <div class="auth-scene-tint" />
            <div class="auth-scene-grain" />
        </div>

        <div class="auth-scene-frame" aria-hidden="true">
            <span class="frame-corner frame-corner--tl" />
            <span class="frame-corner frame-corner--tr" />
            <span class="frame-corner frame-corner--bl" />
            <span class="frame-corner frame-corner--br" />
        </div>

        <header class="auth-scene-topbar">
            <div class="auth-scene-brand">
                <img class="auth-scene-logo" :src="brandStore.logoUrl" :alt="brandStore.name" />
                <div class="auth-scene-brand-text">
                    <BrandName class="auth-scene-brand-name" />
                    <span class="auth-scene-tagline">{{ brandStore.tagline || 'Gestión de hospedaje' }}</span>
                </div>
            </div>

            <q-btn
                flat
                round
                class="auth-scene-toggle"
                :icon="themeStore.dark ? 'light_mode' : 'dark_mode'"
                @click="themeStore.toggle()"
            >
                <q-tooltip>{{ themeStore.dark ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
            </q-btn>
        </header>

        <main class="auth-scene-stage">
            <slot />
        </main>

        <footer class="auth-scene-footer">
            <span>Desarrollado por <strong>DoubLe Team</strong></span>
            <span class="footer-dot" />
            <span>© {{ currentYear }} Todos los derechos reservados</span>
        </footer>
    </div>
</template>

<script setup>
import BrandName from 'src/components/brand/BrandName.vue'
import { useBrandStore } from 'src/stores/brand-store'
import { useThemeStore } from 'src/stores/theme-store'

defineOptions({
    name: 'AuthScene'
})

defineProps({
    /** Contenido único centrado (pantallas de paso) en lugar del layout a dos columnas del login */
    centered: {
        type: Boolean,
        default: false
    }
})

const brandStore = useBrandStore()
const themeStore = useThemeStore()
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.auth-scene {
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: clamp(1.75rem, 3.5vw, 3rem);
    overflow: hidden;
    color: var(--lx-text);
    background: var(--theme-ink, #2a1418);
    font-family: var(--app-font-sans, 'Inter'), system-ui, sans-serif;
}

.auth-scene-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.auth-scene-photo {
    position: absolute;
    inset: -4%;
    background: url('/brand/login-bg.jpg') center right / cover no-repeat;
    animation: kenburns 32s ease-in-out infinite alternate;
    will-change: transform;
}

.auth-scene-tint {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(90deg,
            rgba(var(--theme-ink-rgb, 42, 20, 24), 0.94) 0%,
            rgba(var(--theme-ink-rgb, 42, 20, 24), 0.72) 38%,
            rgba(var(--theme-wine-deep-rgb, 74, 17, 27), 0.38) 70%,
            rgba(var(--theme-ink-rgb, 42, 20, 24), 0.55) 100%),
        linear-gradient(0deg, rgba(0, 0, 0, 0.55) 0%, transparent 35%),
        radial-gradient(ellipse 60% 50% at 78% 55%, rgba(var(--theme-wine-rgb, 122, 31, 43), 0.28), transparent 70%);
}

.auth-scene--centered .auth-scene-tint {
    background:
        radial-gradient(ellipse 55% 60% at 50% 50%,
            rgba(var(--theme-ink-rgb, 42, 20, 24), 0.55) 0%,
            rgba(var(--theme-ink-rgb, 42, 20, 24), 0.88) 100%),
        linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, transparent 35%);
}

.auth-scene-grain {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes kenburns {
    from { transform: scale(1) translate3d(0, 0, 0); }
    to { transform: scale(1.09) translate3d(-1.5%, -1%, 0); }
}

.auth-scene-frame {
    position: absolute;
    inset: clamp(10px, 1.4vw, 18px);
    border: 1px solid rgba(var(--lx-gold-rgb), 0.28);
    pointer-events: none;
    z-index: 1;
}

.auth-scene-frame::after {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1px solid rgba(var(--lx-gold-rgb), 0.12);
}

.frame-corner {
    position: absolute;
    width: 34px;
    height: 34px;
    border-color: var(--lx-gold);
    border-style: solid;
    border-width: 0;
}

.frame-corner::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--lx-gold);
    transform: rotate(45deg);
}

.frame-corner--tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
.frame-corner--tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
.frame-corner--bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
.frame-corner--br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }

.frame-corner--tl::before { top: -4px; left: -4px; }
.frame-corner--tr::before { top: -4px; right: -4px; }
.frame-corner--bl::before { bottom: -4px; left: -4px; }
.frame-corner--br::before { bottom: -4px; right: -4px; }

.auth-scene-topbar {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    animation: lx-fade-in 0.8s ease both;
}

.auth-scene-brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.auth-scene-logo {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
    background: #0a0a0a;
    border: 1px solid var(--lx-gold);
    box-shadow: 0 0 0 4px rgba(var(--lx-gold-rgb), 0.12), 0 10px 24px rgba(0, 0, 0, 0.4);
}

.auth-scene-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
}

.auth-scene-brand-name {
    font-family: var(--app-font-display, 'Playfair Display'), Georgia, serif;
    font-size: 1.35rem;
    font-weight: 600;
    color: #fff;
}

.auth-scene-tagline {
    margin-top: 3px;
    font-size: 0.64rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(var(--lx-gold-rgb), 0.85);
}

.auth-scene-toggle {
    color: var(--theme-gold-pale, #efe0bf);
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(var(--lx-gold-rgb), 0.35);
    backdrop-filter: blur(10px);
}

.auth-scene-stage {
    position: relative;
    z-index: 2;
    flex: 1;
    width: min(1180px, 100%);
    margin: 0 auto;
    padding: clamp(1.5rem, 4vh, 3rem) clamp(0rem, 2vw, 1.5rem);
    display: flex;
    align-items: center;
}

.auth-scene--centered .auth-scene-stage {
    justify-content: center;
}

.auth-scene-footer {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.4rem 0.9rem;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(247, 239, 227, 0.45);
}

.auth-scene-footer strong {
    color: var(--lx-gold);
    font-weight: 600;
}

.footer-dot {
    width: 4px;
    height: 4px;
    background: rgba(var(--lx-gold-rgb), 0.6);
    transform: rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
    .auth-scene-photo {
        animation: none;
    }
}

@media (max-width: 960px) {
    .auth-scene-tint,
    .auth-scene--centered .auth-scene-tint {
        background:
            linear-gradient(180deg,
                rgba(var(--theme-ink-rgb, 42, 20, 24), 0.75) 0%,
                rgba(var(--theme-ink-rgb, 42, 20, 24), 0.88) 55%,
                rgba(var(--theme-ink-rgb, 42, 20, 24), 0.95) 100%);
    }
}

@media (max-width: 520px) {
    .auth-scene {
        padding: 1.4rem 1.1rem;
    }

    .auth-scene-tagline {
        display: none;
    }
}
</style>
