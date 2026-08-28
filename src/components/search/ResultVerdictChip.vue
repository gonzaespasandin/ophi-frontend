<script setup>
import { computed, toRef } from 'vue'
import { useRowVerdict } from '../../composables/useRowVerdict.js'

const props = defineProps({
  profiles: { type: Array, default: () => [] },
  ingredients: { type: Array, default: () => [] },
})

const { verdict, label } = useRowVerdict(toRef(props, 'profiles'), toRef(props, 'ingredients'))

const TONES = {
  safe: { classes: 'bg-ophi-green-soft text-ophi-green-dark', icon: 'fa-check' },
  unsafe: { classes: 'bg-ophi-danger-soft text-ophi-danger', icon: 'fa-triangle-exclamation' },
  unknown: { classes: 'bg-ophi-surface text-ophi-slate', icon: 'fa-question' },
}

const tone = computed(() => TONES[verdict.value] ?? TONES.unknown)
</script>

<template>
  <span
    data-testid="verdict-chip"
    class="inline-flex items-center gap-[6px] px-2 py-[3px] rounded-card font-semibold text-[11px]"
    :class="tone.classes"
  >
    <i class="fa-solid text-[9px]" :class="tone.icon" aria-hidden="true"></i>{{ label }}
  </span>
</template>
