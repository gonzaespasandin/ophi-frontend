<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav>
    <ul class="flex justify-around items-center py-1 bg-[#ffffff] text-[#005B8E]">
      <li>
        <RouterLink to="/" class="flex flex-col items-center justify-center gap-2">
          <i class="fa-solid fa-house"></i>
          Inicio
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/search" class="flex flex-col items-center gap-2">
          <i class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/scanner" class="flex flex-col items-center justify-center gap-2 -translate-y-3/12 bg-[#005B8E] h-[60px] w-[60px] scanner-nav ">
          <img src="../assets/icons/barcode.svg"></img>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/profile" class="flex flex-col items-center gap-2">
          <i class="fa-solid fa-user"></i>
          Perfil
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/history" class="flex flex-col items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left"></i>
          Historial
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>