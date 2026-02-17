<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous', 'golast']);
const props = defineProps({
  where: String
})

</script>

<template>
  <div class="grow flex flex-col">
    <div class="grow">
      <button class="w-full" @click.prevent="emit('previous')"><i class="fa-solid fa-chevron-left pe-2"></i>Volver</button>
      <div>
        <h2 class="text-2xl font-semibold text-center">¿Querés completar tu perfil ahora?</h2>
        <p class="text-center mb-3 mt-2">(Intolerancias, alergias y dietas especiales)</p>
      </div>
    </div>

    <div class="flex flex-col justify-between">
      <button
          class="secondary-action-btn text-black w-full mt-6"
          @click="emit('golast')"
      >
        No, no quiero completarlo ahora
      </button>
      <button
          class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer mt-5 action-btn"
          :disabled="!model.terms_and_conditions"
          @click="emit('next')"
      >Sí, quiero completarlo ahora</button>
    </div>
  </div>
</template>