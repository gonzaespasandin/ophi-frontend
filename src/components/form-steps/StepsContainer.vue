<script setup>
import { ref } from 'vue'
import {useRouter} from "vue-router";

import TermsAndConditions from './TermsAndConditions.vue'
import Intolerances from './Intolerances.vue'
import Allergies from './Allergies.vue'
import Diets from './Diets.vue'
import UserData from './UserData.vue'
import NewProfileData from "./NewProfileData.vue";

const emit = defineEmits(['submit'])

const router = useRouter()

const currentStep = ref(0)
const props = defineProps({steps: {type: Array, required: true}, where: String});
const stepsDictionary = {
  'terms': TermsAndConditions,
  'new_user_data': UserData,
  'intolerances': Intolerances,
  'allergies': Allergies,
  'diets': Diets,
  'new_profile': NewProfileData,
}

const formData = ref({
  terms_and_conditions: false,
  ingredients: [],
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  avatar: '',
})

function handleNext() {
  if(currentStep.value >= (props.steps.length - 1)) {
    //  Execute action
    emit('submit', formData.value)
    return
  }

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
        :where="where"
    />
  </form>
</template>