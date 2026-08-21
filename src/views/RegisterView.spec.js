import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { register } from '../services/auth.js'

const push = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('../services/auth.js', () => ({
  register: vi.fn(),
}))

import RegisterView from './RegisterView.vue'

const WIZARD_DATA = {
  terms_and_conditions: true,
  ingredients: [3, 9],
  name: 'Lucía Méndez',
  email: 'lucia.mendez@ophi.app',
  password: 'SecretaSegura1',
  confirm_password: 'SecretaSegura1',
  avatar: '',
}

// The real wizard fetches ingredient lists on mount; this view only owns the
// submit and what it does with the answer, so a probe stands in for the steps.
const StepsContainerStub = {
  props: ['steps', 'errors', 'loading', 'fill', 'screen'],
  emits: ['submit'],
  setup: () => ({ formData: WIZARD_DATA }),
  template: '<div><slot name="banner" /><button class="submit" @click="$emit(\'submit\', formData)"></button></div>',
}

const mountView = () =>
  mount(RegisterView, { global: { stubs: { StepsContainer: StepsContainerStub } } })

const wizard = wrapper => wrapper.getComponent(StepsContainerStub)
const banner = wrapper => wrapper.find('[role="alert"]')

function rejectWith(status, data = {}) {
  return Promise.reject({ status, response: { data } })
}

async function submit(wrapper) {
  await wrapper.get('.submit').trigger('click')
  await flushPromises()
}

describe('RegisterView', () => {
  beforeEach(() => {
    // restoreMocks does not clear the call history of a vi.fn() from a factory.
    vi.clearAllMocks()
    localStorage.clear()
    register.mockResolvedValue(undefined)
  })

  it('registers with everything the wizard collected', async () => {
    const wrapper = mountView()

    await submit(wrapper)

    expect(register).toHaveBeenCalledWith(WIZARD_DATA)
  })

  // The account and the session are already there. Showing "no pudimos crear tu
  // cuenta" sends the person back to retry and hit "email ya registrado".
  it('does not blame the registration when it went through', async () => {
    const wrapper = mountView()

    await submit(wrapper)

    expect(banner(wrapper).exists()).toBe(false)
    expect(wrapper.text()).not.toContain('No pudimos crear tu cuenta')
  })

  it('drops the saved wizard draft and opens the app', async () => {
    localStorage.setItem('ophi-step-form', JSON.stringify(WIZARD_DATA))
    const wrapper = mountView()

    await submit(wrapper)

    expect(localStorage.getItem('ophi-step-form')).toBeNull()
    expect(push).toHaveBeenCalledWith('/')
  })

  it('marks the rejected fields when the API names them', async () => {
    register.mockImplementation(() => rejectWith(422, {
      errors: { email: ['Este email ya está registrado'] },
    }))
    const wrapper = mountView()

    await submit(wrapper)

    expect(wizard(wrapper).props('errors')).toEqual({ email: ['Este email ya está registrado'] })
    expect(wrapper.text()).toContain('Revisá los campos marcados')
  })

  // ProfileService answers 422 with `errors` as a plain string. Pointing at
  // "los campos marcados" then highlights nothing and hides the real reason.
  it('shows the reason when the API sends it as a plain message', async () => {
    register.mockImplementation(() => rejectWith(422, { errors: 'Usuario no premium' }))
    const wrapper = mountView()

    await submit(wrapper)

    expect(wrapper.text()).toContain('Usuario no premium')
    expect(wrapper.text()).not.toContain('Revisá los campos marcados')
    expect(wizard(wrapper).props('errors')).toEqual({})
  })

  it('says something went wrong when the API gives no detail', async () => {
    register.mockImplementation(() => rejectWith(500))
    const wrapper = mountView()

    await submit(wrapper)

    expect(wrapper.text()).toContain('Ha ocurrido un error al registrar')
  })

  it('stops the wizard from staying busy after a failure', async () => {
    register.mockImplementation(() => rejectWith(500))
    const wrapper = mountView()

    await submit(wrapper)

    expect(wizard(wrapper).props('loading')).toBe(false)
  })
})
