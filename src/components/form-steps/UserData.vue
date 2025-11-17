<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <button type="button" @click="emit('previous')">Volver</button>

  <h2 class="text-2xl font-semibold">¡Último paso!</h2>

  <div>
    <label for="name">Nombre</label>
    <input
        id="name"
        class="border rounded mb-4 block w-full py-1 px-2"
        type="text"
        name="name"
        v-model="model.name">
  </div>

  <div>
    <label for="email">Gmail</label>
    <input
        id="email"
        class="border rounded mb-4 block w-full py-1 px-2"
        type="text"
        name="email"
        v-model="model.email">
  </div>

  <div>
    <label for="password">Contraseña</label>
    <input
        id="password"
        class="border rounded mb-4 block w-full py-1 px-2"
        type="password"
        name="password"
        v-model="model.password">
  </div>

  <div>
    <label for="confirm_password">Confirmar contraseña</label>
    <input
        id="confirm_password"
        class="border rounded mb-4 block w-full py-1 px-2"
        type="password"
        name="confirm_password"
        v-model="model.confirm_password">
  </div>

  <button
      class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer"
      @click="emit('next')"
  >Completar registro</button>
</template>

<style scoped>

</style>