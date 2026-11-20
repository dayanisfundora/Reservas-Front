<template>
  <q-dialog
    v-model="dialog"
    persistent
    transition-show="fade"
    transition-hide="fade"
    class="dialog-load"
  >
    <q-card class="load-panel no-accent-bar">
      <div class="load-ring" aria-hidden="true">
        <span class="load-ring__arc"></span>
      </div>
      <p class="load-text">Cargando…</p>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'DialogLoad'
})

const props = defineProps({
  dialogLoad: Boolean
})

const dialog = computed(() => props.dialogLoad)
</script>

<style scoped>
.load-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  min-width: 148px;
  padding: 28px 32px;
  border-radius: 18px;
  background: var(--app-surface, #fff);
  border: 1px solid color-mix(in srgb, var(--theme-gold, #b8893b) 32%, transparent);
  box-shadow:
    0 20px 48px rgba(var(--theme-wine-rgb, 122, 31, 43), 0.18),
    0 2px 8px rgba(0, 0, 0, 0.04);
}

.load-ring {
  position: relative;
  width: 42px;
  height: 42px;
}

.load-ring__arc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--theme-wine, #7a1f2b) 14%, transparent);
  border-top-color: var(--theme-wine, #7a1f2b);
  border-right-color: var(--theme-gold, #b8893b);
  animation: load-spin 0.75s linear infinite;
}

.load-text {
  margin: 0;
  font-family: var(--app-font-display, 'Playfair Display'), Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--theme-wine-deep, #4a111b);
}

@keyframes load-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.q-dialog.dialog-load .q-dialog__backdrop {
  background: rgba(var(--theme-ink-rgb, 42, 20, 24), 0.52) !important;
}

body.body--dark .q-dialog.dialog-load .q-dialog__backdrop,
body.app-dark .q-dialog.dialog-load .q-dialog__backdrop {
  background: rgba(var(--theme-ink-rgb, 42, 20, 24), 0.78) !important;
}

body.body--dark .dialog-load .load-panel,
body.app-dark .dialog-load .load-panel {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(var(--theme-wine-rgb, 122, 31, 43), 0.28), transparent 55%),
    color-mix(in srgb, var(--theme-dark, #241a1c) 92%, var(--theme-wine-deep, #4a111b)) !important;
  border-color: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.28) !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45) !important;
}

body.body--dark .dialog-load .load-text,
body.app-dark .dialog-load .load-text {
  color: var(--theme-gold-pale, #efe0bf) !important;
}

body.body--dark .dialog-load .load-ring__arc,
body.app-dark .dialog-load .load-ring__arc {
  border-color: color-mix(in srgb, var(--theme-gold, #b8893b) 18%, transparent);
  border-top-color: var(--theme-gold-pale, #efe0bf);
  border-right-color: var(--theme-gold, #b8893b);
}
</style>
