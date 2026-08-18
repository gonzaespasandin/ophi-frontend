<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import IngredientOption from './IngredientOption.vue'

const props = defineProps({
  list: { type: Array, required: true },
  title: { type: String, default: 'Lista completa' },
})

const model = defineModel({ type: Array, default: () => [] })
const emit = defineEmits(['close'])

const query = ref('')
const dialog = useTemplateRef('dialog')

const computedList = computed(() => props.list
  .filter(ingredient => ingredient.name.toLowerCase().includes(query.value.toLowerCase()))
  // Comparing names with > yields a boolean, which Array.sort reads as 0 and
  // leaves the list in fetch order. localeCompare also gets accents right.
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))
)

onMounted(() => dialog.value.showModal())
</script>

<template>
  <dialog
    ref="dialog"
    @click="emit('close')"
    @close="emit('close')"
    class="m-auto w-[min(100%-32px,388px)] max-h-[85svh] overflow-hidden rounded-card shadow-[0_20px_50px_rgba(0,0,0,.3)]"
  >
    <div class="flex flex-col max-h-[85svh]" @click.stop>
      <header class="flex items-center gap-2.5 p-3.5 border-b border-ophi-border">
        <p class="flex-1 min-w-0 font-roboto-slab font-bold text-[15px] text-[#111827]">{{ title }}</p>

        <button
          type="button"
          aria-label="Cerrar"
          class="grid place-items-center shrink-0 w-11 h-11 -m-1.5 rounded-card text-[16px] text-ophi-slate active:bg-ophi-surface transition-colors cursor-pointer"
          @click="dialog.close()"
        ><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </header>

      <div class="px-3.5 pt-3.5">
        <label class="flex items-center gap-2 h-11 px-3.5 rounded-card bg-ophi-surface border border-ophi-border">
          <i class="fa-solid fa-magnifying-glass text-[13px] text-ophi-slate" aria-hidden="true"></i>
          <input
            class="w-full bg-transparent text-[14px] text-[#111827] outline-none"
            type="text"
            v-model.trim="query"
            placeholder="Buscar…"
            aria-label="Buscar ingrediente"
          >
        </label>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto p-3.5">
        <ul v-if="computedList.length" class="flex flex-wrap gap-2">
          <li v-for="item of computedList" :key="item.id">
            <IngredientOption v-model="model" :value="item.id" :label="item.name" variant="chip" />
          </li>
        </ul>

        <p v-else class="py-6 text-center text-[13px] text-ophi-slate">No se encontraron resultados</p>
      </div>

      <footer class="p-3.5 border-t border-ophi-border">
        <button
          type="button"
          class="w-full h-11 rounded-card bg-ophi-action font-semibold text-[13.5px] text-white active:bg-ophi-green-dark transition-colors cursor-pointer"
          @click="dialog.close()"
        >Listo</button>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgb(0 0 0 / 68.5%);
}
</style>
