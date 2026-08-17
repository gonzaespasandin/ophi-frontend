<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  message: { type: String, default: '' },
})

defineEmits(['retry'])
</script>

<template>
  <!--
    The only state that does not live in the sheet: with no camera there is
    nothing behind to reveal, so a panel over a black screen would be theatre.
  -->
  <div
    data-testid="camera-error"
    class="absolute inset-0 z-20 grid place-items-center px-5 pb-[var(--app-bottom-inset)] bg-[#20262B]"
  >
    <div class="max-w-[380px] text-center">
      <span
        class="grid place-items-center w-14 h-14 mx-auto mb-3 rounded-card border-[1.5px] border-dashed border-white/40 bg-white/10 text-[21px] text-white"
        aria-hidden="true"
      >
        <i class="fa-solid fa-camera"></i>
      </span>

      <h2 class="mb-[6px] font-roboto-slab font-bold text-[17px] text-white">
        Necesitamos la cámara
      </h2>

      <p class="mb-4 text-[12.5px] leading-[1.5] text-white/70">
        Sin permiso de cámara no podemos leer códigos. Podés habilitarlo en los ajustes del
        navegador, o buscar el producto por nombre.
      </p>

      <p v-if="message" class="mb-4 font-mono text-[11.5px] leading-[1.45] text-white/45">
        {{ message }}
      </p>

      <div class="flex flex-col gap-[9px]">
        <button
          type="button"
          class="w-full h-11 rounded-card bg-white font-semibold text-[13.5px] text-ophi-blue cursor-pointer active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="$emit('retry')"
        >
          Reintentar el permiso
        </button>

        <RouterLink
          to="/search"
          class="flex items-center justify-center gap-2 w-full h-11 rounded-card border-[1.5px] border-white/45 font-semibold text-[13.5px] text-white active:bg-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          Buscar por nombre
        </RouterLink>
      </div>
    </div>
  </div>
</template>
