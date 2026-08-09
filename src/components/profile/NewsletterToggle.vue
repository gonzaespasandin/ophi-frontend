<script setup>
const props = defineProps({
  subscribed: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-[14px] border-b border-ophi-border">
    <div class="flex-1 min-w-0">
      <h3 id="newsletter-toggle-label" class="mb-[2px] font-semibold text-[14px] text-gray-900">
        Novedades por email
      </h3>
      <p class="text-[12px] text-gray-500">Nuevos alimentos y funciones</p>
    </div>

    <label class="relative shrink-0 w-[52px] h-8 cursor-pointer">
      <input
        type="checkbox"
        role="switch"
        class="sr-only peer"
        aria-labelledby="newsletter-toggle-label"
        :checked="props.subscribed"
        :aria-checked="props.subscribed"
        :disabled="props.loading"
        @change="emit('change', $event.target.checked)"
      />
      <span
        class="block w-full h-full rounded-2xl bg-slate-300 transition-colors peer-checked:bg-ophi-green peer-disabled:opacity-60 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ophi-blue"
      ></span>
      <span
        class="absolute top-[3px] left-[3px] w-[26px] h-[26px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/.25)] transition-transform peer-checked:translate-x-5"
      ></span>
    </label>
  </div>
</template>
