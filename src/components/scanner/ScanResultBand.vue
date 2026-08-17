<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'loading',
    validator: (value) =>
      ['loading', 'safe', 'unsafe', 'unknown', 'not-found', 'neutral'].includes(value),
  },
  barcode: { type: String, default: '' },
  profilesCount: { type: Number, default: 1 },
  unsafeCount: { type: Number, default: 0 },
  conflictCount: { type: Number, default: 0 },
})

defineEmits(['dismiss'])

const isSingleProfile = computed(() => props.profilesCount <= 1)

// The band is the roof of the sheet and it never scrolls away, so it carries the
// answer for as long as the panel is open. It only wears green or red once the
// answer actually arrived: while it travels, and whenever there is nothing to
// compare, it stays slate.
const bandColor = computed(() => ({
  safe: 'bg-ophi-green-dark',
  unsafe: 'bg-ophi-danger',
  'not-found': 'bg-ophi-blue',
}[props.variant] ?? 'bg-ophi-slate'))

const headline = computed(() => {
  if (props.variant === 'loading') return 'Revisando perfiles…'
  if (props.variant === 'not-found') return 'No tenemos este código'
  if (props.variant === 'neutral') return 'Código escaneado'
  if (props.variant === 'unknown') return 'Todavía no podemos darte un veredicto'
  if (props.variant === 'safe') return isSingleProfile.value ? 'Apto para vos' : 'Apto para todos'

  return isSingleProfile.value ? 'No apto para vos' : `No apto para ${props.unsafeCount}`
})

const subline = computed(() => {
  if (props.variant === 'unknown') return ''

  if (props.variant === 'safe') {
    return isSingleProfile.value
      ? 'Ningún ingrediente de tu lista'
      : `de tus ${props.profilesCount} perfiles`
  }

  if (props.variant === 'unsafe') {
    if (!isSingleProfile.value) return `de tus ${props.profilesCount} perfiles`

    return props.conflictCount === 1
      ? '1 ingrediente de tu lista'
      : `${props.conflictCount} ingredientes de tu lista`
  }

  return ''
})

// While there is no product yet the code is the only thing we can honestly show,
// and it doubles as proof of what was read.
const showBarcode = computed(() =>
  Boolean(props.barcode) && ['loading', 'not-found', 'neutral'].includes(props.variant)
)

const canRescan = computed(() => ['safe', 'unsafe'].includes(props.variant))

const isLoading = computed(() => props.variant === 'loading')
</script>

<template>
  <header
    data-testid="scan-band"
    :data-variant="variant"
    class="dot-texture-band rounded-t-[22px] px-4 pb-[46px] transition-colors duration-300"
    :class="bandColor"
    :aria-busy="isLoading || undefined"
  >
    <button
      type="button"
      data-testid="band-grab"
      aria-label="Descartar y volver a la cámara"
      class="grid place-items-center w-full h-8 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      @click="$emit('dismiss')"
    >
      <span class="w-[44%] h-[5px] rounded-card bg-white/55"></span>
    </button>

    <div class="flex items-center gap-[13px] pt-[6px]">
      <span
        v-if="variant === 'safe'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-[#009161] text-[25px] text-white shadow-[0_0_0_3px_rgb(255_255_255/0.9)]"
        aria-hidden="true"
      >
        <i class="fa-solid fa-check"></i>
      </span>
      <span
        v-else-if="variant === 'unsafe'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-white text-[25px] text-ophi-danger shadow-[0_6px_18px_rgb(0_0_0/0.2)]"
        aria-hidden="true"
      >
        <i class="fa-solid fa-triangle-exclamation"></i>
      </span>
      <span
        v-else-if="variant === 'loading'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-white/20 text-[21px] text-white"
        aria-hidden="true"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>
      </span>
      <span
        v-else-if="variant === 'not-found'"
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full bg-white/20 text-[21px] text-white"
        aria-hidden="true"
      >
        <i class="fa-solid fa-barcode"></i>
      </span>
      <span
        v-else
        class="grid place-items-center shrink-0 w-14 h-14 rounded-full border-[1.5px] border-dashed border-white/65 bg-white/20 text-[22px] text-white"
        aria-hidden="true"
      >
        <i class="fa-solid fa-question"></i>
      </span>

      <div class="min-w-0 flex-1">
        <h2 class="font-roboto-slab font-bold text-[22px] leading-[1.15] text-white">
          {{ headline }}
        </h2>
        <p v-if="subline" class="mt-[2px] text-[13.5px] text-white/90">{{ subline }}</p>
        <p v-else-if="showBarcode" class="mt-[2px] font-mono text-[12.5px] text-white/80">
          {{ barcode }}
        </p>
      </div>

      <button
        v-if="canRescan"
        type="button"
        aria-label="Escanear otro producto"
        class="grid place-items-center shrink-0 -mr-[6px] w-11 h-11 rounded-card bg-white/15 text-[16px] text-white cursor-pointer active:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="$emit('dismiss')"
      >
        <i class="fa-solid fa-barcode" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>
