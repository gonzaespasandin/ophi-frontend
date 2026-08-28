<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  searches: { type: Array, default: () => [] },
  // True once the person emptied the history themselves: a first-time user gets
  // the explainer instead, so silence here would be the wrong answer.
  emptied: { type: Boolean, default: false },
})

const emit = defineEmits(['remove', 'clear'])
</script>

<template>
  <section class="step-in">
    <div class="flex items-center gap-[9px] mx-1 mb-[10px]">
      <h2 class="flex-1 font-roboto-slab font-semibold text-[12px] leading-none tracking-[.09em] uppercase text-ophi-blue">
        Búsquedas recientes
      </h2>

      <button
        v-if="searches.length > 0"
        type="button"
        data-test="clear-recent"
        class="min-h-9 px-[10px] rounded-card font-medium text-[12px] text-ophi-slate cursor-pointer active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
        @click="emit('clear')"
      >
        Vaciar
      </button>
    </div>

    <ul v-if="searches.length > 0" class="bg-white rounded-card shadow-card overflow-hidden">
      <li
        v-for="search of searches"
        :key="`${search.name}-${search.brand}`"
        class="flex items-center border-b border-ophi-border last:border-b-0"
      >
        <RouterLink
          :to="`/product/${search.name}/${search.brand}`"
          class="flex flex-1 min-w-0 items-center gap-3 min-h-[60px] py-[11px] pl-[14px] pr-1 active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
        >
          <i class="fa-solid fa-clock-rotate-left shrink-0 text-[13px] text-gray-400" aria-hidden="true"></i>
          <span class="flex-1 min-w-0">
            <span class="block truncate font-semibold text-[14px] text-gray-900">{{ search.name }}</span>
            <span class="block mt-[2px] text-[12px] text-ophi-slate">{{ search.brand }}</span>
          </span>
        </RouterLink>

        <button
          type="button"
          :aria-label="`Quitar ${search.name} del historial`"
          class="grid place-items-center shrink-0 w-11 h-11 mr-2 rounded-card text-[13px] text-gray-400 cursor-pointer active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
          @click="emit('remove', search)"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </li>
    </ul>

    <p v-if="emptied && searches.length === 0" class="mx-1 mt-3 text-[12.5px]/[1.5] text-ophi-slate step-in">
      Listo, no quedó nada en el historial.
    </p>

    <slot name="nudge" />
  </section>
</template>
