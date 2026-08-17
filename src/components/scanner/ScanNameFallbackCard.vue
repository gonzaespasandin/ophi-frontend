<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  modelValue: { type: String, default: '' },
  matches: { type: Array, default: () => [] },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search', 'confirm'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('search')
}

// The typed fragment is highlighted inside every suggestion, and it is escaped
// first: a name can carry "(" and an unescaped fragment blows up the RegExp.
function highlight(name, term) {
  if (!term) return escapeHtml(name)

  const pattern = new RegExp(escapeRegExp(term), 'i')
  const match = name.match(pattern)

  if (!match) return escapeHtml(name)

  const before = escapeHtml(name.slice(0, match.index))
  const hit = escapeHtml(match[0])
  const after = escapeHtml(name.slice(match.index + match[0].length))

  return `${before}<b class="font-semibold text-gray-900">${hit}</b>${after}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <div>
    <section class="p-[14px] rounded-card bg-white shadow-card">
      <label for="scan-name-fallback" class="block mb-[6px] font-medium text-[12.5px] text-gray-700">
        Buscalo por nombre
      </label>

      <input
        id="scan-name-fallback"
        data-testid="name-fallback-input"
        type="text"
        :value="modelValue"
        placeholder="Ej: Yogur descremado frutilla"
        class="w-full h-11 px-3 rounded-card border-[1.5px] border-ophi-border bg-white text-[14.5px] text-gray-900 focus:border-ophi-blue focus:outline-2 focus:outline-offset-0 focus:outline-ophi-blue/25"
        @input="onInput"
      >

      <p v-if="error" class="mt-[6px] text-[12px] text-ophi-danger">{{ error }}</p>

      <ul
        v-if="matches.length"
        class="mt-[10px] rounded-card border border-ophi-border bg-ophi-surface overflow-hidden"
      >
        <li
          v-for="match of matches"
          :key="match.id ?? match.name"
          class="border-b border-ophi-border last:border-b-0"
        >
          <RouterLink
            :to="`/product/${match.name}/${match.brand?.name}`"
            class="flex items-center gap-[9px] min-h-11 py-[10px] px-3 active:bg-ophi-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ophi-blue"
          >
            <i class="fa-solid fa-magnifying-glass shrink-0 text-[11px] text-gray-400" aria-hidden="true"></i>
            <span class="min-w-0 flex-1">
              <span class="block text-[13px] text-gray-600" v-html="highlight(match.name, modelValue)"></span>
              <span v-if="match.brand?.name" class="block font-medium text-[11.5px] text-gray-500">
                {{ match.brand.name }}
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>

      <button
        type="button"
        class="mt-[11px] w-full h-11 rounded-card bg-ophi-green font-semibold text-[13.5px] text-white cursor-pointer active:bg-ophi-green-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
        @click="emit('confirm')"
      >
        Confirmar
      </button>
    </section>

    <p class="mt-[11px] px-1 text-[11.5px] leading-[1.5] text-gray-500">
      Cuando elijas el producto te preguntamos si el código es de ese, y así lo asociamos para todos.
    </p>
  </div>
</template>
