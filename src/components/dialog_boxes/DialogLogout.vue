<template>
  <q-dialog v-model="abrirDialog">
    <q-card class="app-dialog-card">
      <q-card-section class="app-dialog-header">
          <div class="row items-center no-wrap q-gutter-md">
            <div class="app-dialog-icon">
              <q-icon name="logout" size="22px" />
            </div>
            <div class="text-h6">Cerrar sesión</div>
          </div>
      </q-card-section>

      <q-card-section class="app-dialog-body">
        <p class="app-dialog-message">
          ¿Está seguro que desea cerrar sesión?
        </p>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-actions">
        <q-btn flat no-caps class="app-dialog-btn app-dialog-btn--ghost" label="Cancelar" v-close-popup />
        <q-btn unelevated no-caps class="app-dialog-btn app-dialog-btn--solid" label="Aceptar" @click="confirmarLogout()" />
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

const confirmarLogout = () => {
  emit('confirmar')
  abrirDialog.value = false
}
</script>
