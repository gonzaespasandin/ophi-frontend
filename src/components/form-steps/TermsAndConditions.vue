<script setup>
import TermsAndConditionsContent from "../TermsAndConditionsContent.vue";

const model = defineModel()
const emit = defineEmits(['next', 'previous']);
const props = defineProps({
  where: String
})
</script>

<template>
  <div>
    <!-- <button @click.prevent="emit('previous')">Volver</button> -->

    <TermsAndConditionsContent />
    <div class="p-1 text-center mt-4 rounded-[11px] bg-[#ffffff] text-[#333333]">
      <label>
        <input type="checkbox" name="terms_and_conditions" v-model="model.terms_and_conditions">
        Acepto los términos de condiciones y servicios
      </label>
    </div>

    <button
        class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer mt-5 action-btn"
        :disabled="!model.terms_and_conditions"
        @click="emit('next')"
    >Siguiente</button>
  </div>
</template>