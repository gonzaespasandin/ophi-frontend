<script setup>
import { computed } from 'vue'
import PlanPill from './PlanPill.vue'

const props = defineProps({
  name: { type: String, default: '' },
  email: { type: String, default: null },
  fallbackEmail: { type: String, default: '' },
  avatarColor: { type: String, default: '#005B8E' },
  isPremium: { type: Boolean, default: false },
})

const initial = computed(() => props.name?.trim()?.[0]?.toUpperCase() ?? '?')
const displayEmail = computed(() => props.email || props.fallbackEmail)
</script>

<template>
  <div class="bg-ophi-blue dot-texture-band px-4 pt-4 pb-[18px] rounded-b-[22px]">
    <p class="mb-[10px] font-roboto-slab font-semibold text-[12px] tracking-[.1em] uppercase text-white/70">
      Mi cuenta
    </p>

    <div class="flex items-center gap-[14px]">
      <div
        class="grid place-items-center shrink-0 w-[72px] h-[72px] rounded-full font-roboto-slab font-semibold text-[28px] text-white shadow-[0_0_0_3px_rgb(255_255_255/.9),0_4px_14px_rgb(0_0_0/.2)]"
        :style="{ backgroundColor: avatarColor }"
        aria-hidden="true"
      >
        {{ initial }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="mb-[3px] font-roboto-slab font-semibold text-[21px] leading-[1.15] text-white truncate">
          {{ name }}
        </p>
        <p class="mb-2 text-[13px] text-white/80 truncate">{{ displayEmail }}</p>
        <PlanPill :is-premium="isPremium" />
      </div>
    </div>

    <div class="mt-[18px]">
      <slot name="tabs" />
    </div>
  </div>
</template>
