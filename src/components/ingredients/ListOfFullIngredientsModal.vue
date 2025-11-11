<script setup>
import {onMounted, useTemplateRef} from 'vue'

const model = defineModel()
const { list } = defineProps(['list'])
const dialog = useTemplateRef('dialog')
const emit = defineEmits(['close'])

onMounted(() => {
  dialog.value.showModal()
})
</script>

<template>
  <dialog ref="dialog" @close="emit('close')">
    <div>
      <ul>
        <template v-for="item of list" :key="item.id">
          <li v-if="!item.is_group">
            <label>
              <input type="checkbox" name="ingredients[]" :value="item.id" v-model="model">
              {{ item.name }}
            </label>
          </li>
        </template>
      </ul>
    </div>
  </dialog>
</template>

<style scoped></style>