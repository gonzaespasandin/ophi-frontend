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
const props = defineProps({
  steps: {type: Array, required: true}, 
  where: String,
  errors: {type: Object, default: () => ({})},
  loading: {type: Boolean, default: false}
});
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
    <div class="steps-bar"
      :style="`--current-step: ${currentStep + 1}`"
    ><span>{{ currentStep + 1 }} / {{ steps.length }}</span></div>

    <component
        :is="stepsDictionary[steps[currentStep]]"
        v-model="formData"
        @next="handleNext"
        @previous="handlePrevious"
        :where="where"
        :errors="errors"
        :loading="loading"
    />
  </form>
</template>

<style scoped>
.steps-bar {
  position: relative;
  height: 1.75rem;
  margin-inline: -.75rem;
  margin-block: -1.50rem 1rem;

  &::before {
    /* --current-step: 2; */
    content: '';

    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;

    height: 100%;
    width: calc((var(--current-step) / 5) * 100%);

    background-color: #009161;
    transition: width 0.5s ease;
  }

  > span {
    position: absolute;
    left: .5rem;
    top: 0;
    height: 100%;

    z-index: 2;

    display: grid;
    place-content: center;
  }
}
</style>