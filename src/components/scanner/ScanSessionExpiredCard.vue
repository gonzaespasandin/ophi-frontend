<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    data-testid="session-expired"
    class="py-5 px-4 rounded-card bg-white shadow-card text-center"
  >
    <span
      class="grid place-items-center w-11 h-11 mx-auto mb-[10px] rounded-full bg-ophi-blue-soft text-[17px] text-ophi-blue"
      aria-hidden="true"
    >
      <i class="fa-solid fa-arrow-right-to-bracket"></i>
    </span>

    <h2 class="mb-1 font-roboto-slab font-semibold text-[15px] text-gray-900">Tu sesión venció</h2>

    <p class="mb-[13px] text-[12.5px] leading-[1.5] text-gray-500">
      Necesitamos que vuelvas a entrar para leer tus perfiles. Guardamos el código: al volver
      seguimos donde estabas.
    </p>

    <RouterLink
      to="/login"
      class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-blue font-semibold text-[13.5px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
    >
      <i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
      Iniciar sesión
    </RouterLink>
  </section>
</template>
