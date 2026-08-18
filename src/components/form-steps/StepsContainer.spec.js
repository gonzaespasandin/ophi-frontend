import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StepsContainer from './StepsContainer.vue'
import StepProgress from '../auth/StepProgress.vue'

const routed = vi.hoisted(() => ({ step: undefined, push: vi.fn(), back: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routed.push, back: routed.back }),
  useRoute: () => ({
    params: { step: routed.step },
    matched: [{ path: '/register/:step?' }],
  }),
}))

const REGISTER_STEPS = ['terms', 'skip_to_last_step', 'intolerances', 'allergies', 'diets', 'new_user_data']

// The real steps fetch ingredient lists on mount; the container's job is the
// step machinery around them, so they are replaced by a probe that can drive it.
const StepStub = {
  props: ['modelValue'],
  emits: ['next', 'previous', 'golast'],
  template: `
    <div>
      <button class="next" @click="$emit('next')"></button>
      <button class="golast" @click="$emit('golast')"></button>
      <button class="fill" @click="modelValue.email = 'lucia@ophi.app'"></button>
    </div>
  `,
}

function mountWizard(props = {}) {
  return mount(StepsContainer, {
    props: { steps: REGISTER_STEPS, ...props },
    global: {
      stubs: {
        TermsAndConditions: StepStub,
        SkipToLastStep: StepStub,
        Intolerances: StepStub,
        Allergies: StepStub,
        Diets: StepStub,
        UserData: StepStub,
        NewProfileData: StepStub,
      },
    },
  })
}

describe('StepsContainer', () => {
  beforeEach(() => {
    localStorage.clear()
    routed.step = undefined
    routed.push = vi.fn()
    routed.back = vi.fn()
  })

  // "4 / 6" named nothing. The header has to say what is being answered.
  it('names the current step instead of only counting it', () => {
    routed.step = 'allergies'

    const wrapper = mountWizard()

    expect(wrapper.text()).toContain('Alergias')
    expect(wrapper.text()).toContain('Paso 4 de 6')
  })

  it('reflects the current step in the progress bar', () => {
    routed.step = 'diets'

    const wrapper = mountWizard()

    expect(wrapper.getComponent(StepProgress).props()).toMatchObject({ current: 5, total: 6 })
  })

  it('starts on the first step when the route carries no step', () => {
    const wrapper = mountWizard()

    expect(wrapper.text()).toContain('Términos')
    expect(wrapper.text()).toContain('Paso 1 de 6')
  })

  it('routes to the next step by name', async () => {
    routed.step = 'intolerances'
    const wrapper = mountWizard()

    await wrapper.get('.next').trigger('click')

    expect(routed.push).toHaveBeenCalledWith('/register/allergies')
  })

  // App.vue remounts the view on every step, so anything typed has to survive
  // in localStorage or it is gone before the last step is reached.
  it('persists what was filled in before leaving the step', async () => {
    routed.step = 'new_user_data'
    const wrapper = mountWizard()

    await wrapper.get('.fill').trigger('click')
    await wrapper.get('.golast').trigger('click')

    expect(JSON.parse(localStorage.getItem('ophi-step-form')).email).toBe('lucia@ophi.app')
  })

  it('restores what was already filled in on a previous step', () => {
    localStorage.setItem('ophi-step-form', JSON.stringify({ email: 'vuelta@ophi.app', ingredients: [3] }))
    routed.step = 'new_user_data'

    const wrapper = mountWizard()

    expect(wrapper.getComponent(StepStub).props('modelValue')).toMatchObject({
      email: 'vuelta@ophi.app',
      ingredients: [3],
    })
  })

  it('jumps to the last step when the person skips the profile', async () => {
    routed.step = 'skip_to_last_step'
    const wrapper = mountWizard()

    await wrapper.get('.golast').trigger('click')

    expect(routed.push).toHaveBeenCalledWith('/register/new_user_data')
  })

  it('submits the collected data instead of routing past the last step', async () => {
    routed.step = 'new_user_data'
    const wrapper = mountWizard()

    await wrapper.get('.fill').trigger('click')
    await wrapper.get('.next').trigger('click')

    expect(routed.push).not.toHaveBeenCalled()
    expect(wrapper.emitted('submit').at(-1)[0]).toMatchObject({ email: 'lucia@ophi.app' })
  })

  // The terms step scrolls the legal text inside its own card. If the form were
  // free to grow, the band would scroll the card while the card scrolled its
  // text — two nested scrollbars for one document.
  describe('nested scrolling', () => {
    it('pins the form to the band height on the step that scrolls its own content', () => {
      routed.step = 'terms'

      const wrapper = mountWizard()

      expect(wrapper.get('[data-testid="step-form"]').classes()).toContain('h-full')
      expect(wrapper.get('[data-testid="step-form"]').classes()).not.toContain('min-h-full')
    })

    it('lets the form grow on steps whose content is the thing that scrolls', () => {
      routed.step = 'allergies'

      const wrapper = mountWizard()

      expect(wrapper.get('[data-testid="step-form"]').classes()).toContain('min-h-full')
      expect(wrapper.get('[data-testid="step-form"]').classes()).not.toContain('h-full')
    })
  })

  it('titles the shorter add-profile wizard with its own steps', () => {
    routed.step = 'new_profile'

    const wrapper = mountWizard({
      steps: ['intolerances', 'allergies', 'diets', 'new_profile'],
    })

    expect(wrapper.text()).toContain('El perfil')
    expect(wrapper.text()).toContain('Paso 4 de 4')
  })
})
