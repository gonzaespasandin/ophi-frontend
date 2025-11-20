<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <!-- <button type="button" @click="emit('previous')">Volver</button> -->

  <h2 class="text-2xl font-semibold">¿De quién estamos hablando?</h2>

  <div>
    <label for="name">Nombre</label>
    <input
        id="name"
        class="border rounded mb-4 block w-full py-1 px-2"
        type="text"
        name="name"
        v-model="model.name">
  </div>

  <button
      class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer"
      @click="emit('next')"
  >Agregar perfil</button>
</template>

<style scoped>

</style>