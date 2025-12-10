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
  <dialog ref="dialog" @close="emit('close')" class="m-auto w-[min(100%-32px,388px)] min-h-[80dvh] p-4 grid rounded-[11px]">
    <div class="grid grid-rows-[auto_1fr_auto]">
      <input class="w-full py-2 px-4 mb-4 bg-neutral-100 border border-black/10" type="text" v-model.trim="query" placeholder="Buscar...">

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
          class="action-btn mt-4 w-full"
          type="button"
      >Confirmar</button>
    </div>
  </dialog>
</template>

<style scoped>

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.616);
}

</style>