<template>
  <q-card 
    class="menu-card cursor-pointer" 
    @click="router.push(props.link)"
    :class="{ 'menu-card-hover': hover }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="card-content">
      <div class="icon-wrapper">
        <div class="icon-container">
          <q-icon :name="props.icon" size="1.8rem" class="card-icon" />
        </div>
      </div>
      
      <div class="title-container">
        <h3 class="card-title">{{ props.title }}</h3>
      </div>
      
      <div class="card-arrow">
        <q-icon name="arrow_forward" size="1.2rem" :class="{ 'arrow-animate': hover }" />
      </div>
    </div>
  </q-card>
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
.menu-card {
  height: 120px; /* Más rectangular - altura reducida */
  min-height: 120px; /* Altura mínima también reducida */
  border-radius: 16px;
  position: relative;
  overflow: visible; /* Permitir que el icono sobresalga */
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-top: 35px; /* Espacio para el icono que sobresale */
}

.menu-card-hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f8f8f8);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.5rem 1.5rem 1.5rem; /* Más padding superior */
  position: relative;
  z-index: 2;
}

.icon-wrapper {
  position: absolute;
  top: -30px; /* El icono sobresale 30px del borde superior */
  left: 1.5rem;
  z-index: 10; /* Z-index alto para que esté por encima */
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.menu-card-hover .icon-container {
  transform: rotate(-5deg) scale(1.05);
}

.card-icon {
  color: white;
  transition: transform 0.3s ease;
}

.menu-card-hover .card-icon {
  transform: scale(1.1);
}

.title-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  margin-top: 0.5rem; /* Espacio adicional desde arriba */
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #37474f;
  text-align: center;
  margin: 0;
  transition: color 0.3s ease;
  letter-spacing: 0.5px;
  line-height: 1.2;
  word-spacing: -1px;
  hyphens: auto;
}

.menu-card-hover .card-title {
  color: #005f5f;
}

.card-arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
  color: #009595;
}

.menu-card-hover .card-arrow {
  opacity: 1;
}

.arrow-animate {
  animation: bounceRight 1s infinite;
}

@keyframes bounceRight {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

.menu-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  z-index: 1;
}

.menu-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.3));
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
</style>