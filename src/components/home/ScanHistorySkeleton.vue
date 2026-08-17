<template>
  <div class="flex flex-col gap-[10px] p-3">
    <div
      v-for="row in 3"
      :key="row"
      class="flex items-center gap-3 p-[14px] rounded-card bg-[#F5F5F5]"
    >
      <div class="flex-1">
        <div class="h-[14px] w-2/3 mb-[9px] rounded-card shimmer"></div>
        <div class="h-[11px] w-2/5 rounded-card shimmer"></div>
      </div>
      <div class="w-7 h-7 rounded-full shimmer"></div>
    </div>
  </div>
</template>
