<script setup>
defineProps({
  id: { type: String, default: null },
  message: { type: String, required: true },
})
</script>

<template>
  <p
    :id="id"
    role="alert"
    class="mt-2 inline-flex items-center gap-[7px] px-[10px] py-1.5 rounded-card bg-ophi-danger font-medium text-[12.5px] text-white step-in"
  >
    <i class="fa-solid fa-circle-exclamation text-[11px]" aria-hidden="true"></i>{{ message }}
  </p>
</template>
