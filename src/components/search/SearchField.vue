<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar productos…' },
})

const emit = defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <form class="flex items-center bg-white rounded-card overflow-hidden shadow-[0_6px_16px_rgb(0_0_0/0.16)]" @submit.prevent="emit('submit')">
    <!-- Decorative on purpose: the design moved the "run the full search" action
         out of this icon and into the visible row at the end of the suggestions. -->
    <span class="grid place-items-center shrink-0 w-[46px] h-[52px] text-[15px] text-gray-400" aria-hidden="true">
      <i class="fa-solid fa-magnifying-glass"></i>
    </span>

    <input
      id="searchInput"
      name="searchInput"
      type="search"
      enterkeyhint="search"
      autocomplete="off"
      aria-label="Buscar productos"
      :placeholder="placeholder"
      :value="modelValue"
      class="flex-1 min-w-0 h-[52px] p-0 border-0 outline-0 bg-transparent text-[15.5px] text-gray-900 [&::-webkit-search-cancel-button]:hidden"
      @input="emit('update:modelValue', $event.target.value)"
    >

    <button
      v-if="modelValue"
      type="button"
      aria-label="Borrar la búsqueda"
      class="grid place-items-center shrink-0 w-[46px] h-[52px] text-[15px] text-gray-500 cursor-pointer active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
      @click="emit('update:modelValue', '')"
    >
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  </form>
</template>
