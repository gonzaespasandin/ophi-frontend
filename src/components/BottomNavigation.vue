<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav>
    <ul class="grid grid-cols-5 bg-[#ffffff] py-3 text-[#005B8E]">
      <li>
        <RouterLink to="/" class="flex flex-col items-center gap-2">
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
        <RouterLink to="/scanner" class="flex flex-col items-center gap-2">
          <i class="fa-solid fa-barcode text-4xl"></i>
          
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