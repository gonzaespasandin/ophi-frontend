<script setup>
import { computed } from 'vue'
import { checkPasswordRules } from '../../utils/passwordRules.js'

const props = defineProps({
  password: { type: String, default: '' },
  id: { type: String, default: null },
})

const rules = computed(() => checkPasswordRules(props.password))
</script>

<template>
  <div :id="id" class="p-[13px] rounded-card bg-white/10 border border-white/25">
    <p class="mb-2.5 font-medium text-[11.5px] uppercase tracking-[.05em] text-white/75">Tiene que tener</p>

    <ul class="flex flex-col gap-[9px]">
      <li
        v-for="rule in rules"
        :key="rule.key"
        data-testid="password-rule"
        class="flex items-center gap-2.5 font-medium text-[13px] transition-colors"
        :class="rule.met ? 'text-white' : 'text-white/70'"
      >
        <span
          class="grid place-items-center shrink-0 w-5 h-5 rounded-full text-[10px] transition-colors"
          :class="rule.met ? 'bg-ophi-action text-white' : 'bg-white/15 text-white/70'"
        ><i class="fa-solid" :class="rule.met ? 'fa-check' : 'fa-minus'" aria-hidden="true"></i></span>

        {{ rule.label }}<span v-if="rule.met" class="sr-only"> cumplido</span>
      </li>
    </ul>
  </div>
</template>
