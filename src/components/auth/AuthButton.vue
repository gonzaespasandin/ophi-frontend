<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  icon: { type: String, default: null },
  iconPlacement: { type: String, default: 'end' },
  loading: { type: Boolean, default: false },
  loadingLabel: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  // Navigation that looks like an action still has to be a link: nesting a
  // button inside a RouterLink is invalid markup and loses keyboard semantics.
  to: { type: String, default: null },
})

const VARIANTS = {
  primary: 'bg-ophi-action text-white active:bg-ophi-green-dark disabled:bg-[#3E5F78] disabled:opacity-55',
  secondary: 'border-[1.5px] border-white/50 text-white active:bg-white/15 disabled:opacity-55',
  outline: 'border-2 border-ophi-green bg-white text-ophi-green-dark active:bg-ophi-green-soft disabled:opacity-55',
}

const isBlocked = computed(() => props.loading || props.disabled)
const variantClasses = computed(() => VARIANTS[props.variant] ?? VARIANTS.primary)
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : isBlocked"
    class="w-full h-12 flex items-center justify-center gap-[9px] rounded-card font-semibold text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white not-disabled:cursor-pointer disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <i v-if="loading" class="fa-solid fa-spinner fa-spin text-[14px]" aria-hidden="true"></i>
    <i
      v-else-if="icon && iconPlacement === 'start'"
      class="fa-solid text-[13px]"
      :class="icon"
      aria-hidden="true"
    ></i>

    <span>{{ loading && loadingLabel ? loadingLabel : null }}<slot v-if="!(loading && loadingLabel)" /></span>

    <i
      v-if="!loading && icon && iconPlacement === 'end'"
      class="fa-solid text-[13px]"
      :class="icon"
      aria-hidden="true"
    ></i>
  </component>
</template>
