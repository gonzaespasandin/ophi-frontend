<script setup>
defineProps({
  filters: { type: Array, default: () => [] },
})

const emit = defineEmits(['remove', 'clear'])
</script>

<template>
  <!-- Filtering used to change the list with nothing on screen saying why. The
       chips are that missing sentence, and each one is its own undo. -->
  <div
    v-if="filters.length > 0"
    data-testid="filter-chips"
    class="flex flex-wrap items-center gap-2 mx-[2px] mb-3"
  >
    <span
      v-for="filter of filters"
      :key="filter.id"
      class="inline-flex items-center gap-[7px] min-h-9 pl-[11px] pr-[6px] rounded-card bg-ophi-blue font-semibold text-[12.5px] text-white"
    >
      {{ filter.name }}
      <button
        type="button"
        :aria-label="`Quitar el filtro ${filter.name}`"
        class="grid place-items-center w-6 h-6 rounded-[7px] bg-white/20 text-[10px] text-white active:bg-white/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="emit('remove', filter.id)"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </span>

    <button
      type="button"
      data-testid="clear-filters"
      class="min-h-9 px-[10px] rounded-card font-medium text-[12px] text-ophi-slate underline active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      @click="emit('clear')"
    >
      Limpiar todo
    </button>
  </div>
</template>
