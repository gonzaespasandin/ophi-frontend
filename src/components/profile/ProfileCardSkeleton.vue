<script setup>
import SkeletonBlock from '../ui/SkeletonBlock.vue'

const SWATCH_COUNT = 6
</script>

<template>
  <div class="p-4" aria-hidden="true">
    <SkeletonBlock class="w-[130px] h-[13px] mb-[6px]" />
    <SkeletonBlock class="w-full h-11" />

    <div class="mt-[18px]">
      <SkeletonBlock class="w-[120px] h-[13px] mb-[9px]" />
      <div class="grid grid-cols-6 gap-2 justify-items-center">
        <SkeletonBlock
          v-for="swatch of SWATCH_COUNT"
          :key="swatch"
          class="w-11 h-11 rounded-full"
        />
      </div>
    </div>

    <SkeletonBlock class="w-full h-11 mt-[18px]" />
  </div>
</template>
