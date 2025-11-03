<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <button @click.prevent="emit('previous')">Volver</button>

  <h2 class="text-2xl font-semibold">Términos de condiciones y servicios</h2>
  <p class="my-4">Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem Lorem</p>

  <label>
    <input type="checkbox" name="terms_and_conditions" v-model="model.terms_and_conditions">
    Acepto los términos de condiciones y servicios
  </label>

  <!-- TODO: Replace this buttons with components -->
  <button
      class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer"
      :disabled="!model.terms_and_conditions"
      @click="emit('next')"
  >Siguiente</button>
</template>

<style scoped>

</style>