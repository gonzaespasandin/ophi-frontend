<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String
})
</script>

<template>
  <!-- <button type="button" @click="emit('previous')">Volver</button> -->

  <h2 class="text-2xl font-semibold text-center" :class="props.where === 'addNew' ? 'text-lg' : 'text-2xl'">¿De quién estamos hablando?</h2>

  <div class="mt-3">
    <label for="name">Nombre</label>
    <input
        id="name"
        class="block border-b-1 border-b-[#009161] text-black w-full p-2 mb-2 rounded-t-[.2rem] bg-[#f5f5f5]"
        type="text"
        name="name"
        v-model="model.name">
  </div>

  <button
      class="action-btn w-full"
      @click="emit('next')"
  >Agregar perfil</button>
</template>

<style scoped>

</style>