<script setup>
import AllergiesPicker from "../ingredients/AllergiesPicker.vue";


const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String
})


</script>

<template>
    <div class="flex flex-col grow">
      <button
          type="button"
          class="border border-black/20 hover:bg-black/10 hover:border-black/30 transition cursor-pointer inline-flex items-center py-2 px-4 gap-2 me-auto mb-2 rounded-[11px]"
          @click.prevent="emit('previous')"
      ><i class="fa-solid fa-chevron-left pe-2"></i> Volver</button>

      <div>
        <h2 class="text-2xl font-semibold text-center">¿Tenés alguna alergia?</h2>
        <p class="text-center mb-3 mt-2">Seleccioná todas las que correspondan</p>
      </div>

      <div class="flex flex-col justify-between grow">
        <AllergiesPicker loading-theme="white" v-model="model.ingredients" />
        <button
            class="action-btn mt-6 w-full"
            @click="emit('next')"
        >Siguiente</button>
      </div>
    </div>
</template>



<style scoped>
  .modal {
    margin: auto;
    padding: 14px;
    border-radius: 11px;
  }

  .modal::backdrop {
    background-color: rgba(0, 0, 0, 0.685);
  }
</style>