import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserData from './UserData.vue'

const emptyForm = () => ({
  terms_and_conditions: true,
  ingredients: [],
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  avatar: '',
})

function mountStep(form = emptyForm(), props = {}) {
  return mount(UserData, { props: { modelValue: form, ...props } })
}

const emailField = wrapper => wrapper.get('#email')
const nameField = wrapper => wrapper.get('#profile-name')
const submit = wrapper => wrapper.get('[data-testid="complete-registration"]')

describe('UserData', () => {
  it('infers the profile name from the email so the field is not empty work', async () => {
    const form = emptyForm()
    const wrapper = mountStep(form)

    await emailField(wrapper).setValue('lucia.mendez@ophi.app')

    expect(form.name).toBe('Lucia')
  })

  it('ignores an address that is not an email yet', async () => {
    const form = emptyForm()
    const wrapper = mountStep(form)

    await emailField(wrapper).setValue('lucia.mendez@')

    expect(form.name).toBe('')
  })

  // Inferring is a convenience, not a correction: once somebody names their
  // profile, later edits to the email must not overwrite what they chose.
  it('stops inferring once the name was edited by hand', async () => {
    const form = emptyForm()
    const wrapper = mountStep(form)

    await emailField(wrapper).setValue('lucia.mendez@ophi.app')
    await nameField(wrapper).setValue('Lu')
    await emailField(wrapper).setValue('otra.persona@ophi.app')

    expect(form.name).toBe('Lu')
  })

  it('shows the initial of the name on the avatar', async () => {
    const form = emptyForm()
    const wrapper = mountStep(form)

    await nameField(wrapper).setValue('Martina')

    expect(wrapper.get('[data-testid="profile-avatar"]').text()).toBe('M')
  })

  it('falls back to a named profile rather than submitting an empty one', async () => {
    const form = { ...emptyForm(), password: 'Secreta12', confirm_password: 'Secreta12' }
    const wrapper = mountStep(form)

    await submit(wrapper).trigger('click')

    expect(form.name).toBe('Usuario principal')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  // The server rejects a mismatch too, but only after a round trip that throws
  // away nothing visible — the person just sees the last step fail.
  it('blocks the submit when the two passwords do not match', async () => {
    const form = { ...emptyForm(), name: 'Lucía', password: 'Secreta12', confirm_password: 'Secreta13' }
    const wrapper = mountStep(form)

    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toBeUndefined()
    expect(wrapper.text()).toContain('Las contraseñas no coinciden')
  })

  it('lets the submit through once the passwords match', async () => {
    const form = { ...emptyForm(), name: 'Lucía', password: 'Secreta12', confirm_password: 'Secreta12' }
    const wrapper = mountStep(form)

    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('shows the errors the server sent back for a field', () => {
    const wrapper = mountStep(emptyForm(), { errors: { email: ['Ese email ya tiene una cuenta'] } })

    expect(wrapper.text()).toContain('Ese email ya tiene una cuenta')
  })

  it('does not let a second submit through while the first is in flight', () => {
    const wrapper = mountStep(emptyForm(), { loading: true })

    expect(submit(wrapper).attributes('disabled')).toBeDefined()
  })
})
