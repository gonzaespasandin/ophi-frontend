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
  <dialog ref="dialog" @close="emit('close')" class="m-auto w-[min(100%-32px,388px)] min-h-[80dvh] p-4 rounded-[11px]">
    <div class="flex justify-end py-3">
      <div @click="dialog.close()" class="w-[20%] flex justify-end">
        <i class="fa-solid fa-xmark text-lg" ></i>
      </div>

    </div>
    <div class="grid grid-rows-[auto_1fr_auto]">
      <div class="flex items-center bg-[#f5f5f5] rounded-[11px] shadow-md py-2 px-4 mb-4">
        <input class="w-full search" type="text" v-model.trim="query" placeholder="Buscar...">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>

      <ul v-if="computedList.length">
        <template v-for="item of computedList" :key="item.id">
          <li v-if="!item.is_group" class="input-checkbox mb-2 flex items-center justify-between">
            <label class="w-full">
              <input type="checkbox" name="ingredients[]" :value="item.id" v-model="model">
              {{ item.name }}

            </label>
            <i class="fa-solid fa-arrow-right"></i>
          </li>
        </template>
      </ul>

      <p v-else>No se econtraron resultados</p>

      <button
          @click="dialog.close()"
          class="action-btn mt-4 w-full hover:cursor-pointer"
          type="button"
      >Confirmar</button>
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