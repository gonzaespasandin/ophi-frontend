import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { resetPassword } from '../services/auth.js'

const push = vi.hoisted(() => vi.fn())

const RouterLink = vi.hoisted(() => ({ props: ['to'], template: '<a :href="to"><slot /></a>' }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { token: 'un-token', email: 'lucia.mendez@ophi.app' } }),
  useRouter: () => ({ push }),
  RouterLink,
}))

vi.mock('../services/auth.js', () => ({
  resetPassword: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

import ResetPassword from './ResetPassword.vue'

// AuthButton resolves RouterLink globally, the way the router plugin registers it.
const mountView = () => mount(ResetPassword, { global: { components: { RouterLink } } })

const submit = wrapper => wrapper.get('[data-testid="save-password"]')
const password = wrapper => wrapper.get('#password')

function rejectWith(status, data = {}) {
  return Promise.reject({ status, response: { data } })
}

// jsdom does not implicitly submit a form when its submit button is clicked,
// so the form event stands in for the press.
async function fillAndSubmit(wrapper, value = 'SecretaSegura1') {
  await password(wrapper).setValue(value)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('ResetPassword', () => {
  beforeEach(() => {
    resetPassword.mockResolvedValue({ status: 'ok' })
  })

  // Somebody arriving from the email has no idea which account the link is for,
  // and the address is right there in the URL.
  it('shows the account the link belongs to', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('lucia.mendez@ophi.app')
  })

  it('keeps the submit blocked until the password meets the rules', async () => {
    const wrapper = mountView()

    expect(submit(wrapper).attributes('disabled')).toBeDefined()

    await password(wrapper).setValue('SecretaSegura1')

    expect(submit(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('sends the token and email from the link along with the new password', async () => {
    const wrapper = mountView()

    await fillAndSubmit(wrapper)

    expect(resetPassword).toHaveBeenCalledWith({
      token: 'un-token',
      email: 'lucia.mendez@ophi.app',
      password: 'SecretaSegura1',
    })
  })

  // Landing on login with no message is the only signal that a security action
  // worked. Confirm it, and let the person leave when they read it.
  describe('once the password was changed', () => {
    it('confirms the change instead of redirecting on its own', async () => {
      const wrapper = mountView()

      await fillAndSubmit(wrapper)

      expect(wrapper.text()).toContain('Contraseña actualizada')
      expect(push).not.toHaveBeenCalled()
    })

    it('offers the way into the app', async () => {
      const wrapper = mountView()

      await fillAndSubmit(wrapper)

      expect(wrapper.get('[data-testid="go-to-login"]').attributes('href')).toBe('/login')
    })
  })

  // The API answers 422 with a stable code for a spent or expired token. Before
  // that, any answer looked like success and the person was sent to login.
  describe('when the link is no longer valid', () => {
    it('says the link expired instead of claiming success', async () => {
      resetPassword.mockImplementation(() => rejectWith(422, { code: 'passwords.token' }))
      const wrapper = mountView()

      await fillAndSubmit(wrapper)

      expect(wrapper.text()).toContain('Enlace expirado')
      expect(wrapper.text()).not.toContain('Contraseña actualizada')
    })

    it('sends the person to ask for a new email', async () => {
      resetPassword.mockImplementation(() => rejectWith(422, { code: 'passwords.token' }))
      const wrapper = mountView()

      await fillAndSubmit(wrapper)

      expect(wrapper.get('[data-testid="ask-new-email"]').attributes('href')).toBe('/forgot-password')
    })

    it('treats an unknown account the same way', async () => {
      resetPassword.mockImplementation(() => rejectWith(422, { code: 'passwords.user' }))
      const wrapper = mountView()

      await fillAndSubmit(wrapper)

      expect(wrapper.text()).toContain('Enlace expirado')
    })
  })

  it('shows what the server rejected about the password', async () => {
    resetPassword.mockImplementation(() => rejectWith(422, {
      errors: { password: ['La contraseña es demasiado larga'] },
    }))
    const wrapper = mountView()

    await fillAndSubmit(wrapper)

    expect(wrapper.text()).toContain('La contraseña es demasiado larga')
  })

  // A request can fail after the reset already committed, so the screen cannot
  // assert either outcome. It says what it knows and names the way to find out.
  it('does not claim to know whether the password changed when the request fails', async () => {
    resetPassword.mockImplementation(() => rejectWith(500))
    const wrapper = mountView()

    await fillAndSubmit(wrapper)

    expect(wrapper.text()).toContain('No pudimos confirmar el cambio')
    expect(wrapper.text()).not.toContain('sigue siendo la de antes')
    expect(password(wrapper).element.value).toBe('SecretaSegura1')
  })
})
