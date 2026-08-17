<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    data-testid="no-restrictions"
    class="py-4 px-4 rounded-card bg-white shadow-card text-center"
  >
    <span
      class="grid place-items-center w-12 h-12 mx-auto mb-[10px] rounded-card bg-ophi-blue-soft text-[19px] text-ophi-blue"
      aria-hidden="true"
    >
      <i class="fa-solid fa-list-check"></i>
    </span>

    <h2 class="mb-[5px] font-roboto-slab font-bold text-[15px] text-gray-900">
      Contanos qué evitás
    </h2>

    <p class="mb-[13px] text-[12px] leading-[1.5] text-gray-600">
      Ningún perfil tiene restricciones cargadas, así que no hay con qué comparar los ingredientes.
    </p>

    <RouterLink
      to="/profile"
      class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-blue font-semibold text-[13.5px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
    >
      <i class="fa-solid fa-list-check" aria-hidden="true"></i>
      Cargar restricciones
    </RouterLink>
  </section>
</template>
