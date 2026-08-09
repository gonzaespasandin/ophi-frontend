<script setup>
import SkeletonBlock from '../ui/SkeletonBlock.vue'
</script>

<template>
  <div aria-hidden="true">
    <div class="p-4 border-b border-ophi-border">
      <SkeletonBlock class="w-[110px] h-[14px] mb-3" />
      <SkeletonBlock class="w-[180px] h-[13px] mb-3" />

      <div class="grid gap-3">
        <div>
          <SkeletonBlock class="w-[90px] h-[13px] mb-[6px]" />
          <SkeletonBlock class="w-full h-11" />
        </div>
        <div>
          <SkeletonBlock class="w-[140px] h-[13px] mb-[6px]" />
          <SkeletonBlock class="w-full h-11" />
        </div>
        <SkeletonBlock class="w-full h-11 mt-1" />
      </div>
    </div>

    <div class="flex items-center gap-3 px-4 py-[14px] border-b border-ophi-border">
      <div class="flex-1 min-w-0">
        <SkeletonBlock class="w-[150px] h-[14px] mb-[2px]" />
        <SkeletonBlock class="w-[190px] h-[12px]" />
      </div>
      <SkeletonBlock class="shrink-0 w-[52px] h-8 rounded-2xl" />
    </div>
  </div>
</template>
