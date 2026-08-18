<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TermsAndConditions from './TermsAndConditions.vue'
import Intolerances from './Intolerances.vue'
import Allergies from './Allergies.vue'
import Diets from './Diets.vue'
import UserData from './UserData.vue'
import NewProfileData from './NewProfileData.vue'
import SkipToLastStep from './SkipToLastStep.vue'
import AuthHeader from '../auth/AuthHeader.vue'
import AuthBand from '../auth/AuthBand.vue'
import StepProgress from '../auth/StepProgress.vue'
import { useAuthBandEntrance } from '../../composables/useAuthBandEntrance.js'

const emit = defineEmits(['submit'])

const router = useRouter()
const route = useRoute()

const props = defineProps({
  steps: { type: Array, required: true },
  errors: { type: Object },
  loading: { type: Boolean, default: false },
  // The register wizard owns the viewport and scrolls inside its own band.
  // The add-profile wizard flows inside AuthLayout, which already scrolls.
  fill: { type: Boolean, default: false },
  screen: { type: String, default: 'register' },
})

const stepsDictionary = {
  'terms': TermsAndConditions,
  'new_user_data': UserData,
  'intolerances': Intolerances,
  'allergies': Allergies,
  'diets': Diets,
  'new_profile': NewProfileData,
  'skip_to_last_step': SkipToLastStep,
}

const stepTitles = {
  'terms': 'Términos',
  'skip_to_last_step': 'Tu perfil',
  'intolerances': 'Intolerancias',
  'allergies': 'Alergias',
  'diets': 'Dietas',
  'new_user_data': 'Tu cuenta',
  'new_profile': 'El perfil',
}

const emptyForm = () => ({
  terms_and_conditions: false,
  ingredients: [],
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  avatar: '',
})

const currentStep = ref(0)
const formData = ref(emptyForm())

const animateBand = useAuthBandEntrance(props.screen)

// A step that holds its own scroll region needs the form pinned to the band's
// height, not merely filling it: flex-1 has nothing to shrink into while the
// form is free to grow, and the result is the band scrolling the card while the
// card scrolls its own content.
const stepsWithOwnScroll = new Set(['terms'])

const stepName = computed(() => props.steps[currentStep.value])
const hasOwnScrollRegion = computed(() => stepsWithOwnScroll.has(stepName.value))
const stepTitle = computed(() => stepTitles[stepName.value] ?? '')
const stepPosition = computed(() => `Paso ${currentStep.value + 1} de ${props.steps.length}`)

// Resolved during setup, not on mount: the route already knows which step this
// is, and deferring it renders step 1 for a frame before correcting itself.
loadCurrentStep()

function changeStep(step) {
  localStorage.setItem('ophi-step-form', JSON.stringify(formData.value))

  router.push(generateRouteForStep(props.steps[step]))
}

function loadCurrentStep() {
  formData.value = JSON.parse(localStorage.getItem('ophi-step-form')) ?? emptyForm()

  const routedStep = route.params.step ? route.params.step : props.steps[0]
  const index = props.steps.indexOf(routedStep)

  currentStep.value = index === -1 ? 0 : index
}

function generateRouteForStep(step) {
  const baseUrl = route.matched[0].path
  return baseUrl.replace(':step?', step)
}

function handleNext() {
  if(currentStep.value >= (props.steps.length - 1)) {
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
  <div class="flex flex-col" :class="fill && 'h-full min-h-0'">
    <div class="flex-none bg-[#F5F5F5] dot-texture-page px-5 pt-4 pb-3.5">
      <AuthHeader :title="stepTitle" :subtitle="stepPosition" @back="handlePrevious" />

      <StepProgress class="mt-3.5" :current="currentStep + 1" :total="steps.length" />
    </div>

    <AuthBand
      :animate="animateBand"
      :scrolls="fill"
      :class="fill ? 'flex-1 min-h-0' : 'min-h-[68svh]'"
    >
      <form
        action="#"
        method="post"
        @submit.prevent
        data-testid="step-form"
        class="flex flex-col px-4 pt-[22px] pb-[26px]"
        :class="hasOwnScrollRegion ? 'h-full' : 'min-h-full'"
      >
        <slot name="banner" />

        <component
          :key="currentStep"
          :is="stepsDictionary[stepName]"
          v-model="formData"
          @next="handleNext"
          @previous="handlePrevious"
          @golast="goToLastStep"
          :loading="loading"
          :errors="errors"
        />
      </form>
    </AuthBand>
  </div>
</template>
