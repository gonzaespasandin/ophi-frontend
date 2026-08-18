<script setup>
import AuthButton from '../auth/AuthButton.vue'

defineEmits(['retry'])
</script>

<template>
  <div class="px-3.5 py-[18px] text-center">
    <span class="grid place-items-center w-10 h-10 mx-auto mb-2.5 rounded-card bg-ophi-danger-soft text-[15px] text-ophi-danger">
      <i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i>
    </span>

    <p class="mb-1 font-roboto-slab font-semibold text-[13.5px] text-[#111827]">No pudimos traer la lista</p>
    <p class="mb-3 text-[12px]/[1.45] text-ophi-slate">Podés seguir y cargarla después desde tu perfil.</p>

    <AuthButton
      variant="outline"
      icon="fa-rotate-right"
      icon-placement="start"
      class="h-11 text-[13px]"
      @click="$emit('retry')"
    >Reintentar</AuthButton>
  </div>
</template>
