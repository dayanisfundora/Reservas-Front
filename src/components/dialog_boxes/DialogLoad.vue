<template>
  <q-dialog
    v-model="dialog"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="load-panel">
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
  --load-primary: var(--q-primary, #041e33);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  min-width: 148px;
  padding: 28px 32px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid color-mix(in srgb, var(--load-primary) 10%, transparent);
  box-shadow:
    0 20px 48px rgba(15, 23, 42, 0.18),
    0 2px 8px rgba(15, 23, 42, 0.04);
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
  border: 3px solid color-mix(in srgb, var(--load-primary) 12%, transparent);
  border-top-color: var(--load-primary);
  animation: load-spin 0.75s linear infinite;
}

.load-text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--load-primary);
}

@keyframes load-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
