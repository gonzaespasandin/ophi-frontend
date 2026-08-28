<script setup>
defineProps({
  code: { type: String, required: true },
})
</script>

<template>
  <!-- A receipt of what the person just did, not a system warning: the code is
       data, so it is rendered as text and never as an editable field. -->
  <div class="flex items-center gap-[11px] p-3 rounded-card bg-white/15 border border-white/25">
    <span class="grid place-items-center shrink-0 w-10 h-10 rounded-card bg-white/15 text-[15px] text-white" aria-hidden="true">
      <i class="fa-solid fa-barcode"></i>
    </span>

    <div class="flex-1 min-w-0">
      <p class="mb-[2px] font-semibold text-[13px] text-white">Todavía no tenemos este código</p>
      <p class="truncate font-mono text-[12px] text-white/80">{{ code }}</p>
    </div>
  </div>
</template>
