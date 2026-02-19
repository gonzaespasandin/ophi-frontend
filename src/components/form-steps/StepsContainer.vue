<script setup>
import { ref, onMounted } from 'vue'
import {useRoute, useRouter} from "vue-router";
import TermsAndConditions from './TermsAndConditions.vue'
import Intolerances from './Intolerances.vue'
import Allergies from './Allergies.vue'
import Diets from './Diets.vue'
import UserData from './UserData.vue'
import NewProfileData from "./NewProfileData.vue";
import SkipToLastStep from "./SkipToLastStep.vue";

const emit = defineEmits(['submit'])

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const props = defineProps({
  steps: {type: Array, required: true},
  where: String,
  errors: {type: Object},
  loading: {type: Boolean, default: false}
});

const stepsDictionary = {
  'terms': TermsAndConditions,
  'new_user_data': UserData,
  'intolerances': Intolerances,
  'allergies': Allergies,
  'diets': Diets,
  'new_profile': NewProfileData,
  'skip_to_last_step': SkipToLastStep
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

onMounted(loadCurrentStep)

function changeStep(step) {
  localStorage.setItem('ophi-step-form', JSON.stringify(formData.value))

  router.push(generateRouteForStep(props.steps[step]))
}

function loadCurrentStep() {
  formData.value = JSON.parse(localStorage.getItem('ophi-step-form')) ?? {
    terms_and_conditions: false,
    ingredients: [],
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    avatar: '',
  }
  const stepName = route.params.step ? route.params.step : props.steps[0]

  currentStep.value = props.steps.indexOf(stepName)
}

function generateRouteForStep(step) {
  const baseUrl = route.matched[0].path
  return baseUrl.replace(':step?', step)
}

function handleNext() {
  if(currentStep.value >= (props.steps.length - 1)) {
    //  Execute action
    localStorage.removeItem('ophi-step-form')
    emit('submit', formData.value)
    return
  }

  currentStep.value += 1
  changeStep(currentStep.value)
}

function handlePrevious() {
  router.back()
}

function goToLastStep() {
  currentStep.value = props.steps.length - 1
  changeStep(currentStep.value)
}
</script>

<template>
  <form action="#" method="post" @submit.prevent>
    <div :class="props.where === 'addNew' ? 'profile-steps-bar' : 'steps-bar'"
      :style="`--current-step: ${currentStep + 1}; --max-steps: ${props.steps.length}`"
    ><span>{{ currentStep + 1 }} / {{ steps.length }}</span></div>
    

    <component
        :key="currentStep"
        :is="stepsDictionary[steps[currentStep]]"
        v-model="formData"
        @next="handleNext"
        @previous="handlePrevious"
        @golast="goToLastStep"
        :where="where"
        :loading="loading"
        :errors="errors"
    />
  </form>
</template>

<style scoped>
.steps-bar {
  position: relative;
  height: 1.75rem;
  margin-inline: -.75rem;
  margin-block: -1.50rem 1rem;
  color: white;
  &::before {
    /* --current-step: 2; */
    content: '';

    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;

    height: 100%;
    width: calc((var(--current-step) / var(--max-steps)) * 100%);

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

.profile-steps-bar {
  position: relative;
  height: 1.75rem;
  padding: 1rem;
  color: white;

  margin-bottom: 1rem;
  
  &::before {
    /* --current-step: 2; */
    content: '';

    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    
    height: 100%;
    width: calc((var(--current-step) / var(--max-steps)) * 100%);
    border-radius: 11px;
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