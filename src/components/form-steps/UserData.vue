<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String
})


</script>

<template>
  <!-- <button type="button" @click="emit('previous')">Volver</button> -->

  <h2 class="text-2xl font-semibold text-center">¡Último paso!</h2>

  <div class="flex flex-col justify-center p-4 min-h-80 bg-[#005B8E]">
    <div>
      <label for="name">Nombre</label>
      <input
          id="name"
          class="block border inputs text-black"
          type="text"
          name="name"
          v-model="model.name">
    </div>

    <div>
      <label for="email">Gmail</label>
      <input
          id="email"
          class="block border inputs text-black"
          type="text"
          name="email"
          v-model="model.email">
    </div>

    <div>
      <label for="password">Contraseña</label>
      <input
          id="password"
          class="block border inputs text-black"
          type="password"
          name="password"
          v-model="model.password">
    </div>

    <div>
      <label for="confirm_password">Confirmar contraseña</label>
      <input
          id="confirm_password"
          class="block border inputs text-black"
          type="password"
          name="confirm_password"
          v-model="model.confirm_password">
    </div>

    <button
        class="action-btn mt-6"
        @click="emit('next')"
    >Completar registro</button>
  </div>
</template>

<style scoped>

</style>