<template>
  <q-dialog v-model="abrirDialog" persistent>
    <q-card class="app-dialog-card">
      <q-card-section class="app-dialog-header">
          <div class="row items-center no-wrap q-gutter-md">
            <div class="app-dialog-icon">
              <q-icon name="delete_forever" size="22px" />
            </div>
            <div class="text-h6">Eliminar</div>
          </div>
      </q-card-section>

      <q-card-section class="app-dialog-body">
        <p class="app-dialog-message">
          ¿Está seguro que desea eliminar el elemento seleccionado?
        </p>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-actions">
        <q-btn flat no-caps class="app-dialog-btn app-dialog-btn--ghost" label="Cancelar" v-close-popup />
        <q-btn unelevated no-caps class="app-dialog-btn app-dialog-btn--solid" label="Aceptar" @click="confirmarEliminacion()" />
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
  },
  idElemento: {
    type: Number,
    required: true
  }
})

const abrirDialog = ref(props.isOpen)

watch(() => props.isOpen, (newVal) => {
  abrirDialog.value = newVal
})

watch(abrirDialog, (newVal) => {
  if (!newVal) {
    emit('closeDialog')
  }
})

const emit = defineEmits(['eliminar', 'closeDialog'])

const confirmarEliminacion = () => {
  emit('eliminar', props.idElemento)
  abrirDialog.value = false
  emit('closeDialog')
}
</script>
