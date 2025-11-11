<script setup>
import { ref } from 'vue'
import {useRouter} from "vue-router";

import TermsAndConditions from './TermsAndConditions.vue'
import TypesOfProfile from "./TypesOfProfile.vue"
import Intolerances from './Intolerances.vue'
import Allergies from './Allergies.vue'
import Diets from './Diets.vue'
import UserData from './UserData.vue'

  const emit = defineEmits(['submit'])

const router = useRouter()

const currentStep = ref(0)
const props = defineProps({steps: {type: Array, required: true}})
const stepsDictionary = {
  'terms': TermsAndConditions,
  'new_user_data': UserData,
  'intolerances': Intolerances,
  'allergies': Allergies,
  'diets': Diets,
}

const formData = ref({
  terms_and_conditions: false,
  ingredients: [],
  user_data: {
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  }
})

function handleNext() {
  if(currentStep.value >= (props.steps.length - 1)) {
    //  Execute action
    emit('submit', formData.value)
    return
  }

/* STEPS FOR REGISTRATION
* 1. Terminos y condiciones
* 2. ¿A qué deberías pretar atención? (Intolerancias / Alergias alimentarias / Dietas especiales / Todas)
* 3. ¿Qué intolerancias querés configurar?
* 4. ¿Qué alergias gestionas actualmente?
* 5. Forma de alimentación
* 6. Otros datos (gmail, name, etc.)
* 6. Resumen
* */
  currentStep.value += 1
}

function handlePrevious() {
  if(currentStep.value <= 0) {
    //  Execute action
    router.back()
    return
  }

  currentStep.value -= 1
}
</script>

<template>
  <form action="#" method="post" @submit.prevent>
    <component
        :is="stepsDictionary[steps[currentStep]]"
        v-model="formData"
        @next="handleNext"
        @previous="handlePrevious"
    />
  </form>
</template>