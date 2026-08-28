<script setup>
defineProps({
  rows: { type: Number, default: 3 },
})
</script>

<template>
  <!-- Replaces the full-screen spinner: the shape of the answer stays on screen,
       so the field and the filter button above never leave. -->
  <div data-testid="result-skeleton" aria-hidden="true">
    <div class="shimmer mx-1 mb-3 w-[120px] h-3 rounded-card"></div>

    <div class="rounded-card bg-white shadow-card overflow-hidden">
      <div
        v-for="row of rows"
        :key="row"
        data-testid="skeleton-row"
        class="flex items-center gap-3 px-[14px] py-3 border-b border-ophi-border last:border-b-0"
      >
        <div class="shimmer shrink-0 w-12 h-12 rounded-card"></div>

        <div class="flex-1">
          <div class="shimmer mb-[7px] w-[74%] h-[14px] rounded-card"></div>
          <div class="shimmer mb-[7px] w-[40%] h-[11px] rounded-card"></div>
          <!-- The verdict chip needs its own slot here, otherwise every row
               grows taller the moment the data lands and the list jumps. -->
          <div data-testid="skeleton-verdict" class="shimmer w-[104px] h-[18px] rounded-card"></div>
        </div>
      </div>
    </div>
  </div>
</template>
