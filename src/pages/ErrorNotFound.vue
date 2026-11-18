<template>
    <AuthScene centered>
        <section class="status-card lux-card lux-card--stripe lux-enter">
            <div class="lux-label">Habitación no encontrada</div>
            <div class="status-code">404</div>
            <h1 class="lux-title status-title">Esta suite <em>no existe</em></h1>
            <p class="lux-text status-text">La dirección que buscas no existe o fue movida.</p>

            <div class="lux-rule status-rule"><span class="lux-diamond" /></div>

            <q-btn unelevated no-caps class="lux-btn lux-btn--compact" to="/">
                <q-icon name="home" size="18px" class="q-mr-sm" />
                <span>Volver al inicio</span>
            </q-btn>
        </section>
    </AuthScene>
</template>

<script setup>
import AuthScene from 'src/components/brand/AuthScene.vue'

defineOptions({
    name: 'ErrorNotFound'
})
</script>

<style scoped>
.status-card {
    width: min(480px, 100%);
    padding: 2.2rem 2rem 2.8rem;
    text-align: center;
}

.status-code {
    margin: 0.4rem 0 0.2rem;
    font-family: var(--app-font-display), Georgia, serif;
    font-style: italic;
    font-size: clamp(4.5rem, 10vw, 6.5rem);
    font-weight: 500;
    line-height: 1;
    background: linear-gradient(100deg, var(--theme-gold-pale), var(--lx-gold) 40%, var(--theme-gold) 70%, var(--theme-gold-pale));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.status-title {
    font-size: clamp(1.5rem, 3vw, 1.9rem);
}

.status-text {
    margin: 0.75rem auto 0;
    max-width: 22rem;
}

.status-rule {
    margin: 1.5rem auto 1.4rem;
    max-width: 220px;
}
</style>
