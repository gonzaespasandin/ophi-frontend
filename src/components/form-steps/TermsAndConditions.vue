<script setup>
import TermsAndConditionsContent from "../TermsAndConditionsContent.vue";
import AuthButton from "../auth/AuthButton.vue";

const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <!-- min-h-0 so the card below is what shrinks; a flex item defaults to
       min-height:auto and would push the overflow back onto the band. -->
  <div class="flex flex-col flex-1 min-h-0 step-in">
    <h2 class="mb-1 font-roboto-slab font-bold text-[21px]/[1.2] text-white">Términos y condiciones</h2>
    <p class="mb-4 text-[13.5px]/[1.5] text-white/80">Leelos antes de seguir. Son cortos.</p>

    <!-- Takes whatever height is left instead of a fixed 330px: the band would
         otherwise scroll the card while the card scrolled its own text. The
         floor keeps it readable when the fixed parts eat the screen. -->
    <div class="flex-1 min-h-[140px] p-4 overflow-y-auto rounded-card bg-white shadow-[0_6px_16px_rgba(0,0,0,.14)]">
      <TermsAndConditionsContent />
    </div>

    <label class="flex items-center gap-3 mt-3.5 p-3.5 rounded-card bg-white shadow-[0_6px_16px_rgba(0,0,0,.1)] cursor-pointer">
      <input
        type="checkbox"
        name="terms_and_conditions"
        v-model="model.terms_and_conditions"
        class="shrink-0 w-6 h-6 accent-ophi-action cursor-pointer"
      >
      <span class="flex-1 font-medium text-[13.5px]/[1.4] text-[#333333]">
        Acepto los términos y condiciones del servicio
      </span>
    </label>

    <AuthButton
      icon="fa-arrow-right"
      :disabled="!model.terms_and_conditions"
      class="mt-4"
      @click="emit('next')"
    >Siguiente</AuthButton>
  </div>
</template>
