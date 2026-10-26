<template>
    <div>
        <q-btn size="16px" flat round dense icon="help_outline" class="quick-help-trigger" @click="emit('open-help')">
            <q-tooltip class="bg-primary">Ayuda de esta pantalla</q-tooltip>

            <q-badge v-if="helpCount > 0" floating rounded color="warning" text-color="dark" class="quick-help-badge">
                {{ helpCount }}
            </q-badge>
        </q-btn>
    </div>
</template>

<script setup>
defineProps({
    helpCount: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['open-help'])
</script>

<style scoped>
.quick-help-trigger {
    overflow: visible;
}

.quick-help-badge {
    top: -3px;
    right: -3px;
    min-width: 18px;
    height: 18px;
    font-size: 11px;
    line-height: 18px;
    padding: 0 4px;
}
</style>
