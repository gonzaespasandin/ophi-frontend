<script setup>
defineProps({
  title: { type: String, default: null },
  message: { type: String, required: true },
})
</script>

<template>
  <div
    role="alert"
    class="flex gap-2.5 p-[13px] rounded-card bg-ophi-danger text-white step-in"
    :class="title ? 'items-start' : 'items-center'"
  >
    <i
      class="fa-solid fa-circle-exclamation text-[14px]"
      :class="title && 'mt-0.5'"
      aria-hidden="true"
    ></i>

    <div class="flex-1">
      <p v-if="title" class="mb-[3px] font-semibold text-[13.5px]">{{ title }}</p>
      <p :class="title ? 'text-[12.5px]/[1.45] text-white/90' : 'font-medium text-[13.5px]/[1.4]'">{{ message }}</p>
    </div>
  </div>
</template>
