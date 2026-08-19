import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { sendEmailToResetPassword } from '../services/auth.js'

const RouterLink = vi.hoisted(() => ({ props: ['to'], template: '<a :href="to"><slot /></a>' }))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink,
}))

vi.mock('../services/auth.js', () => ({
  sendEmailToResetPassword: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

import ForgotPassword from './ForgotPassword.vue'

const mountView = () => mount(ForgotPassword, { global: { components: { RouterLink } } })

const email = wrapper => wrapper.get('#email')

async function request(wrapper, address = 'lucia.mendez@ophi.app') {
  await email(wrapper).setValue(address)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendEmailToResetPassword.mockResolvedValue({ status: 'ok' })
  })

  it('does not call the API with an address that is not an email', async () => {
    const wrapper = mountView()

    await request(wrapper, 'lucia.mendez')

    expect(sendEmailToResetPassword).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Escribí un email válido')
  })

  it('asks the API for a link for the address typed', async () => {
    const wrapper = mountView()

    await request(wrapper)

    expect(sendEmailToResetPassword).toHaveBeenCalledWith({ email: 'lucia.mendez@ophi.app' })
  })

  describe('once the request went through', () => {
    // The API answers 200 whether or not the account exists, on purpose: it must
    // not leak which addresses are registered. So the copy cannot claim the mail
    // was sent — only that it left if there was somebody to send it to.
    it('does not claim the email exists', async () => {
      const wrapper = mountView()

      await request(wrapper)

      expect(wrapper.text()).toContain('Si hay una cuenta con este email')
    })

    it('leaves the form behind and shows what to do next', async () => {
      const wrapper = mountView()

      await request(wrapper)

      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.text()).toContain('Revisá tu correo')
      expect(wrapper.text()).toContain('lucia.mendez@ophi.app')
    })

    // The expiry is already said on the form and inside the email itself.
    // Repeating it on this card only crowds the one thing left to do: go look.
    it('points at the spam folder without repeating the expiry', async () => {
      const wrapper = mountView()

      await request(wrapper)

      expect(wrapper.text()).toContain('correo no deseado')
      expect(wrapper.text()).not.toContain('60 minutos')
    })

    it('lets the person correct the address without losing what they typed', async () => {
      const wrapper = mountView()

      await request(wrapper)
      await wrapper.get('[data-testid="edit-email"]').trigger('click')

      expect(email(wrapper).element.value).toBe('lucia.mendez@ophi.app')
    })
  })

  describe('resending', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    // Without a pause, an impatient tap sends four mails and the person cannot
    // tell which link is the live one.
    it('holds the resend closed for a while after sending', async () => {
      const wrapper = mountView()
      await request(wrapper)

      expect(wrapper.get('[data-testid="resend"]').attributes('disabled')).toBeDefined()

      vi.advanceTimersByTime(30000)
      await flushPromises()

      expect(wrapper.get('[data-testid="resend"]').attributes('disabled')).toBeUndefined()
    })

    it('asks for another email once the pause is over', async () => {
      const wrapper = mountView()
      await request(wrapper)

      vi.advanceTimersByTime(30000)
      await flushPromises()
      await wrapper.get('[data-testid="resend"]').trigger('click')
      await flushPromises()

      expect(sendEmailToResetPassword).toHaveBeenCalledTimes(2)
      expect(wrapper.get('[data-testid="resend"]').attributes('disabled')).toBeDefined()
    })
  })

  // The person is looking at the sent card, so the form's error surfaces are
  // not on screen. Without one here a failed resend is indistinguishable from
  // a successful one.
  it('shows the failure when a resend does not go through', async () => {
    vi.useFakeTimers()
    const wrapper = mountView()
    await request(wrapper)

    vi.advanceTimersByTime(30000)
    await flushPromises()
    sendEmailToResetPassword.mockRejectedValue({ status: 500, response: { data: {} } })
    await wrapper.get('[data-testid="resend"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No pudimos enviar el correo')
    vi.useRealTimers()
  })

  it('holds the resend closed after a failure too, so it cannot be hammered', async () => {
    vi.useFakeTimers()
    const wrapper = mountView()
    await request(wrapper)

    vi.advanceTimersByTime(30000)
    await flushPromises()
    sendEmailToResetPassword.mockRejectedValue({ status: 500, response: { data: {} } })
    await wrapper.get('[data-testid="resend"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="resend"]').attributes('disabled')).toBeDefined()
    vi.useRealTimers()
  })

  it('does not carry an error back into the form when the address is corrected', async () => {
    const wrapper = mountView()
    await request(wrapper)

    sendEmailToResetPassword.mockRejectedValue({ status: 500, response: { data: {} } })
    await wrapper.get('[data-testid="resend"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="edit-email"]').trigger('click')

    expect(wrapper.text()).not.toContain('No pudimos enviar el correo')
  })

  // Validating the trimmed value and sending the raw one means a stray space
  // passes the local check and comes back as a server error instead.
  it('sends the address without the surrounding whitespace it accepted', async () => {
    const wrapper = mountView()

    await request(wrapper, '  lucia.mendez@ophi.app  ')

    expect(sendEmailToResetPassword).toHaveBeenCalledWith({ email: 'lucia.mendez@ophi.app' })
  })

  it('shows what the server rejected about the email', async () => {
    sendEmailToResetPassword.mockRejectedValue({
      status: 422,
      response: { data: { errors: { email: ['Ese email no es válido'] } } },
    })
    const wrapper = mountView()

    await request(wrapper)

    expect(wrapper.text()).toContain('Ese email no es válido')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('keeps the form open and says what failed when the request errors', async () => {
    sendEmailToResetPassword.mockRejectedValue({ status: 500, response: { data: {} } })
    const wrapper = mountView()

    await request(wrapper)

    expect(wrapper.text()).toContain('No pudimos enviar el correo')
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
