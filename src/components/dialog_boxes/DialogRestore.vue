<template>
  <q-dialog v-model="abrirDialog">
    <q-card class="app-dialog-card">
      <q-card-section class="app-dialog-header">
          <div class="row items-center no-wrap q-gutter-md">
            <div class="app-dialog-icon">
              <q-icon name="restart_alt" size="22px" />
            </div>
            <div class="text-h6">Restaurar ayuda</div>
          </div>
      </q-card-section>

      <q-card-section class="app-dialog-body">
        <p class="app-dialog-message">
          ¿Está seguro que desea restaurar la ayuda?
        </p>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-actions">
        <q-btn flat no-caps class="app-dialog-btn app-dialog-btn--ghost" label="Cancelar" v-close-popup />
        <q-btn unelevated no-caps class="app-dialog-btn app-dialog-btn--solid" label="Aceptar" @click="confirmarRestaurar()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['confirmar', 'closeDialog'])

const abrirDialog = ref(props.isOpen)

watch(() => props.isOpen, (newVal) => {
  abrirDialog.value = newVal
})

watch(abrirDialog, (newVal) => {
  if (!newVal) {
    emit('closeDialog')
  }
})

const confirmarRestaurar = () => {
  emit('confirmar')
  abrirDialog.value = false
}
</script>
