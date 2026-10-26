<template>
  <button
    type="button"
    class="nom-tile"
    :class="{ 'nom-tile--hover': hover }"
    @click="router.push(props.link)"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <span class="nom-tile__accent" aria-hidden="true" />

    <span class="nom-tile__icon" aria-hidden="true">
      <q-icon :name="props.icon" size="2rem" />
    </span>

    <span class="nom-tile__title">{{ props.title }}</span>
  </button>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hover = ref(false)

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.nom-tile {
  --tile-primary: var(--q-primary, #041e33);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  min-height: 132px;
  padding: 22px 16px 20px;
  border: 1px solid color-mix(in srgb, var(--tile-primary) 10%, transparent);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.nom-tile--hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--tile-primary) 26%, transparent);
  background: color-mix(in srgb, var(--tile-primary) 4%, #ffffff);
  box-shadow:
    0 10px 24px color-mix(in srgb, var(--tile-primary) 12%, transparent);
}

.nom-tile__accent {
  position: absolute;
  left: 0;
  top: 18%;
  bottom: 18%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--tile-primary);
  opacity: 0;
  transform: scaleY(0.4);
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.nom-tile--hover .nom-tile__accent {
  opacity: 1;
  transform: scaleY(1);
}

.nom-tile__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tile-primary);
  background: color-mix(in srgb, var(--tile-primary) 9%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--tile-primary) 14%, transparent);
  transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
}

.nom-tile--hover .nom-tile__icon {
  color: #ffffff;
  background: var(--tile-primary);
  border-color: var(--tile-primary);
}

.nom-tile__title {
  max-width: 100%;
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
  text-align: center;
  color: color-mix(in srgb, var(--tile-primary) 88%, #0f172a);
}
</style>
