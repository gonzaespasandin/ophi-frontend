<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <section class="bg-white rounded-card shadow-card overflow-hidden">
    <div class="flex items-center gap-[9px] px-4 py-[13px] bg-ophi-surface border-b border-ophi-border">
      <i :class="icon" class="text-ophi-blue text-[13px]" aria-hidden="true"></i>
      <h2 class="font-roboto-slab font-semibold text-[13px] tracking-[.05em] uppercase text-ophi-blue">
        {{ title }}
      </h2>
    </div>
    <slot />
  </section>
</template>
