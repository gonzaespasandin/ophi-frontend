<script setup>
import { nextTick, ref } from 'vue'

const model = defineModel({ type: String, default: 'perfil' })

const tabs = [
  { value: 'perfil', label: 'MI PERFIL', icon: 'fa-solid fa-user' },
  { value: 'familiar', label: 'FAMILIAR', icon: 'fa-solid fa-users' },
]

const tabElements = ref([])

function select(index) {
  model.value = tabs[index].value
  nextTick(() => tabElements.value[index]?.focus())
}

function handleKeydown(event) {
  const current = tabs.findIndex((tab) => tab.value === model.value)
  const targets = {
    ArrowRight: (current + 1) % tabs.length,
    ArrowLeft: (current - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  }

  if (!(event.key in targets)) return

  event.preventDefault()
  select(targets[event.key])
}
</script>

<template>
  <div
    role="tablist"
    aria-label="Contexto de perfil"
    class="flex gap-[5px] p-[5px] bg-white/16 border border-white/28 rounded-card"
    @keydown="handleKeydown"
  >
    <button
      v-for="(tab, index) of tabs"
      :key="tab.value"
      :ref="(el) => (tabElements[index] = el)"
      type="button"
      role="tab"
      :id="`profile-tab-${tab.value}`"
      :aria-controls="`profile-panel-${tab.value}`"
      :aria-selected="model === tab.value"
      :tabindex="model === tab.value ? 0 : -1"
      class="flex flex-1 items-center justify-center gap-[7px] h-11 rounded-[9px] font-semibold text-[13px] cursor-pointer transition active:scale-[.97]"
      :class="model === tab.value
        ? 'bg-ophi-green text-white shadow-[0_2px_8px_rgb(0_0_0/.22)]'
        : 'bg-transparent text-[#E8F1F7] active:bg-white/12'"
      @click="select(index)"
    >
      <i :class="tab.icon" class="text-[12px]" aria-hidden="true"></i>
      {{ tab.label }}
    </button>
  </div>
</template>
