<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  verdict: {
    type: String,
    default: 'loading',
    validator: (value) => ['loading', 'unknown', 'safe', 'unsafe'].includes(value),
  },
  profilesCount: { type: Number, default: 1 },
  unsafeCount: { type: Number, default: 0 },
  conflictCount: { type: Number, default: 0 },
})

defineEmits(['back'])

const isLoading = computed(() => props.verdict === 'loading')
const isSingleProfile = computed(() => props.profilesCount <= 1)

// The band carries the answer before any word is read, so it never wears green
// or red while the answer is still travelling.
const bandColor = computed(() => ({
  safe: 'bg-ophi-green-dark',
  unsafe: 'bg-ophi-danger',
}[props.verdict] ?? 'bg-ophi-slate'))

const title = computed(() =>
  props.verdict === 'unknown' ? 'Producto escaneado' : 'Resultado del escaneo'
)

const headline = computed(() => {
  if (props.verdict === 'unknown') return 'Todavía no podemos darte un veredicto'
  if (props.verdict === 'safe') return isSingleProfile.value ? 'Apto para vos' : 'Apto para todos'

  return isSingleProfile.value ? 'No apto para vos' : `No apto para ${props.unsafeCount}`
})

const subline = computed(() => {
  if (props.verdict === 'unknown') return ''

  if (props.verdict === 'safe') {
    return isSingleProfile.value
      ? 'Ningún ingrediente de tu lista'
      : `de tus ${props.profilesCount} perfiles`
  }

  if (!isSingleProfile.value) return `de tus ${props.profilesCount} perfiles`

  return props.conflictCount === 1
    ? '1 ingrediente de tu lista'
    : `${props.conflictCount} ingredientes de tu lista`
})
</script>

<template>
  <header
    data-testid="verdict-band"
    class="dot-texture-band px-4 pb-[46px] rounded-b-[22px] transition-colors duration-300"
    :class="bandColor"
    :aria-busy="isLoading || undefined"
  >
    <div class="flex items-center gap-2 pt-2 pb-[10px]">
      <button
        type="button"
        aria-label="Volver"
        class="grid place-items-center shrink-0 -ml-[10px] w-11 h-11 rounded-card text-[19px] text-white cursor-pointer active:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
        @click="$emit('back')"
      >
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>

      <span class="flex-1 min-w-0 truncate font-semibold text-[12px] tracking-[.1em] uppercase text-white/80">
        {{ title }}
      </span>

      <RouterLink
        to="/scanner"
        aria-label="Escanear otro producto"
        class="grid place-items-center shrink-0 -mr-[6px] w-11 h-11 rounded-card bg-white/15 text-[16px] text-white active:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <i class="fa-solid fa-barcode" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <div v-if="isLoading" class="flex items-center gap-[13px]">
      <span class="shrink-0 w-14 h-14 rounded-full bg-white/20"></span>
      <span class="flex-1">
        <span class="block mb-2 w-[62%] h-5 rounded-card bg-white/25"></span>
        <span class="block w-[40%] h-3 rounded-card bg-white/20"></span>
      </span>
    </div>

    <div v-else class="flex items-center gap-[13px]">
      <span
        v-if="verdict === 'safe'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-[#009161] text-[25px] text-white shadow-[0_0_0_3px_rgb(255_255_255/0.9)]"
        aria-hidden="true"
      >
        <i class="fa-solid fa-check"></i>
      </span>
      <span
        v-else-if="verdict === 'unsafe'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-white text-[25px] text-ophi-danger shadow-[0_6px_18px_rgb(0_0_0/0.18)]"
        aria-hidden="true"
      >
        <i class="fa-solid fa-triangle-exclamation"></i>
      </span>
      <span
        v-else
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full border-[1.5px] border-dashed border-white/65 bg-white/20 text-[22px] text-white"
        aria-hidden="true"
      >
        <i class="fa-solid fa-question"></i>
      </span>

      <div class="min-w-0">
        <h1 class="font-roboto-slab font-bold text-[24px] leading-[1.15] text-white">{{ headline }}</h1>
        <p v-if="subline" class="mt-[2px] text-[13.5px] text-white/90">{{ subline }}</p>
      </div>
    </div>
  </header>
</template>
