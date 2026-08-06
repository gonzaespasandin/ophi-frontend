<script setup>
const props = defineProps({
  subscribed: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])
</script>

<template>
  <section class="bg-white shadow-md p-5 rounded-[11px]">
    <label class="flex items-center justify-between gap-4 cursor-pointer">
      <span>
        <span class="text-[#005B8E] font-semibold text-xl block">Novedades</span>
        <span class="text-sm">Recibí noticias de Ophi por email</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        class="w-6 h-6 accent-[#005B8E]"
        :checked="props.subscribed"
        :aria-checked="props.subscribed"
        :disabled="props.loading"
        @change="emit('change', $event.target.checked)"
      />
    </label>
  </section>
</template>
