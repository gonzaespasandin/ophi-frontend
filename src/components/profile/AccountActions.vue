<script setup>
const emit = defineEmits(['logout'])
</script>

<template>
  <div>
    <div
      class="flex items-center gap-[11px] px-4 py-[15px] text-gray-400"
      aria-disabled="true"
    >
      <i class="fa-solid fa-receipt w-4 text-center" aria-hidden="true"></i>
      <span class="flex-1 font-medium text-[14px]">Historial de pagos</span>
    </div>

    <button
      id="logout-trigger"
      type="button"
      class="flex items-center gap-[11px] w-full px-4 py-[15px] min-h-11 text-left border-t border-ophi-border bg-white hover:bg-ophi-danger-soft active:bg-ophi-danger-soft cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-ophi-danger focus-visible:-outline-offset-2"
      @click="emit('logout')"
    >
      <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-ophi-danger" aria-hidden="true"></i>
      <span class="flex-1 font-semibold text-[14px] text-ophi-danger">Cerrar sesión</span>
    </button>
  </div>
</template>
