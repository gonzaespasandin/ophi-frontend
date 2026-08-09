<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { suscribeToAuthObserver } from '../services/auth.js';

const user = ref({});
suscribeToAuthObserver((state) => (user.value = state));

const navItems = computed(() => [
  { to: '/', icon: 'fa-solid fa-house', label: 'Inicio' },
  { to: '/search', icon: 'fa-solid fa-magnifying-glass', label: 'Buscar' },
  { to: '/profile', icon: 'fa-solid fa-user', label: 'Perfil' },
  user.value?.role === 'admin'
    ? { to: '/admin/scanner', icon: 'fa-solid fa-wand-magic-sparkles', label: 'Admin' }
    : { to: '/history', icon: 'fa-solid fa-clock-rotate-left', label: 'Historial' },
]);
</script>

<template>
  <nav
    aria-label="Navegación principal"
    class="absolute inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] h-[114px] pointer-events-none z-40"
  >
    <div
      class="nav-island absolute inset-x-[14px] bottom-4 h-[66px] bg-white rounded-[22px] shadow-[0_12px_30px_rgb(16_24_40/0.2),0_2px_6px_rgb(16_24_40/0.08)] flex items-center pointer-events-auto"
    >
      <template v-for="(item, index) in navItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="flex-1 h-[58px] flex flex-col items-center justify-center gap-[3px] rounded-2xl text-[#4e4e4e] font-medium text-[10px] active:text-ophi-blue focus-visible:outline-2 focus-visible:outline-ophi-blue focus-visible:-outline-offset-2"
          active-class="text-ophi-blue font-semibold"
        >
          <i :class="item.icon" class="text-[17px]" aria-hidden="true"></i>
          {{ item.label }}
        </RouterLink>

        <template v-if="index === 1">
          <RouterLink
            to="/scanner"
            aria-label="Escanear código de barras"
            class="absolute left-1/2 -translate-x-1/2 bottom-[29px] h-[70px] w-[70px] rounded-full bg-ophi-blue border-4 border-[#1c90cd] shadow-[0_0_0_5px_#F1F2F4,0_10px_24px_rgb(0_91_142/0.4)] flex items-center justify-center active:bg-ophi-blue-dark focus-visible:outline-3 focus-visible:outline-[var(--action)] focus-visible:outline-offset-[6px]"
          >
            <img src="../assets/icons/barcode.svg" alt="" aria-hidden="true" class="max-w-[64%] h-auto">
          </RouterLink>

          <div class="w-[82px] flex-none"></div>
        </template>
      </template>
    </div>
  </nav>
</template>
