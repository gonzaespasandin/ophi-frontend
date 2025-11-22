<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav>
    <ul class="flex justify-around items-center py-1 bg-[#ffffff] text-[#4e4e4e]">
      <li>
        <RouterLink to="/" class="flex flex-col items-center justify-center gap-2" active-class="router-link-active router-link-exact-active">
          <i class="fa-solid fa-house"></i>
          Inicio
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/search" class="flex flex-col items-center gap-2" active-class="router-link-active router-link-exact-active">
          <i class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </RouterLink>
      </li>
      <li  class="z-40">
        <RouterLink to="/scanner" class="flex flex-col items-center justify-center gap-2 -translate-y-3/12 bg-[#005B8E] h-[70px] w-[70px] rounded-full border-4 border-[#1c90cd] shadow-[0_0_0_2px_#dbe0e5_inset]" active-class="router-link-active router-link-exact-active">
          <img src="../assets/icons/barcode.svg" class="max-w-[64%] h-auto"></img>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/profile" class="flex flex-col items-center gap-2" active-class="router-link-active router-link-exact-active">
          <i class="fa-solid fa-user"></i>
          Perfil
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/history" class="flex flex-col items-center gap-2" active-class="router-link-active router-link-exact-active">
          <i class="fa-solid fa-clock-rotate-left"></i>
          Historial
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
