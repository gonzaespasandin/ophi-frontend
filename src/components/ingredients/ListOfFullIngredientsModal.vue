<script setup>
import {computed, onMounted, ref, useTemplateRef} from 'vue'

const query = ref('');
const model = defineModel()
const { list } = defineProps(['list'])
const dialog = useTemplateRef('dialog')
const emit = defineEmits(['close'])

const computedList = computed(() => {
  return list
      .filter(i => i.name.toLowerCase().includes(query.value.toLowerCase()))
      .sort((a, b) => a.name > b.name);
});

onMounted(() => {
  dialog.value.showModal()
})
</script>

<template>
  <dialog ref="dialog" @click="emit('close')" @close="emit('close')" class="h-[90vh] overflow-hidden shadow-lg m-auto w-[min(100%-32px,388px)] rounded-[11px]">
    <div class="flex flex-col h-full" @click.stop>
      <!-- Close modal -->
      <header class="p-4 border-b border-black/20 flex justify-between items-center">
        <p class="font-family-roboto-slab text-xl">Lista completa</p>
        <button type="button" @click="dialog.close()" class="cursor-pointer grid p-2" title="Cerrar">
          <i class="fa-solid fa-xmark text-lg" ></i>
        </button>
      </header>

      <!-- Search ingredient -->
      <div class="flex items-center bg-[#f5f5f5] rounded-[11px] shadow-md py-2 px-4 m-4">
        <input class="w-full search" type="text" v-model.trim="query" placeholder="Buscar...">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>

      <!-- Full list -->
      <div class="overflow-x-auto h-full border border-black/20 p-2">
        <ul v-if="computedList.length" class="grid gap-2">
          <template v-for="item of computedList" :key="item.id">
            <li>
              <label
                  class="flex justify-between items-center gap-2 py-3 px-4 rounded-[11px] shadow-md cursor-pointer transition"
                  :class="model.includes(item.id) ? 'bg-[#005B8E] text-white' : 'bg-white text-[#005B8E]'"
              >
                <span>
                  <input class="mr-2" type="checkbox" name="ingredients[]" :value="item.id" v-model="model">
                  {{ item.name }}
                </span>

                <i class="fa-solid fa-arrow-right"></i>
              </label>
            </li>
          </template>
        </ul>

        <p v-else>No se econtraron resultados</p>
      </div>

      <!-- Confirm button -->
      <footer class="p-4">
        <button
            @click="dialog.close()"
            class="action-btn w-full hover:cursor-pointer"
            type="button"
        >Confirmar</button>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.616);
}

.search {
  &:focus {
    outline: none;
    border: none;
  }
}

</style>