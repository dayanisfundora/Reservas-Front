<template>
    <div class="not-found-page flex column flex-center q-pa-lg">
        <q-card flat class="not-found-card text-center">
            <div class="not-found-code">404</div>
            <div class="not-found-title">Página no encontrada</div>
            <p class="not-found-text">La dirección que buscas no existe o fue movida.</p>
            <q-btn unelevated color="primary" icon="home" label="Volver al inicio" to="/" />
        </q-card>
    </div>
</template>

<script setup>
defineOptions({
    name: 'ErrorNotFound'
})
</script>

<style scoped>
.not-found-page {
    min-height: 100vh;
    background: var(--app-auth-bg);
}

.not-found-card {
    width: min(480px, 100%);
    border-radius: 24px;
    padding: 2.5rem 2rem;
    background: var(--app-surface);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28) !important;
    animation: fadeRise 0.45s ease both;
}

.not-found-code {
    font-family: var(--app-font-display);
    font-size: 4.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--app-primary);
}

.not-found-title {
    margin-top: 0.75rem;
    font-family: var(--app-font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--app-ink);
}

.not-found-text {
    margin: 0.75rem auto 1.5rem;
    color: var(--app-ink-muted);
}
</style>
