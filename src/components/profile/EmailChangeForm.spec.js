import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EmailChangeForm from './EmailChangeForm.vue'
import PendingEmailNotice from './PendingEmailNotice.vue'
import RateLimitNotice from './RateLimitNotice.vue'

const account = { email: 'lucia@ophi.app', pending_email: null, newsletter_subscribed: false }

function mountForm(props = {}) {
  return mount(EmailChangeForm, { props: { account, ...props } })
}

describe('EmailChangeForm', () => {
  it('submits the new email and the current password', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[type="email"]').setValue('nueva@ophi.app')
    await wrapper.get('input[type="password"]').setValue('secreta')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ newEmail: 'nueva@ophi.app', currentPassword: 'secreta' }],
    ])
  })

  it('clears the password field after submitting', async () => {
    const wrapper = mountForm()

    await wrapper.get('input[type="email"]').setValue('nueva@ophi.app')
    await wrapper.get('input[type="password"]').setValue('secreta')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('input[type="password"]').element.value).toBe('')
  })

  it('announces a pending email confirmation', () => {
    const wrapper = mountForm({
      account: { ...account, pending_email: 'nueva@ophi.app' },
    })

    expect(wrapper.getComponent(PendingEmailNotice).props('email')).toBe('nueva@ophi.app')
    expect(wrapper.get('[role="status"]').text()).toContain('nueva@ophi.app')
  })

  it('shows no pending notice when there is nothing to confirm', () => {
    const wrapper = mountForm()

    expect(wrapper.findComponent(PendingEmailNotice).exists()).toBe(false)
  })

  it('replaces the generic error block with the rate limit notice on 429', () => {
    const wrapper = mountForm({ error: { field: 'rate-limit' } })

    expect(wrapper.findComponent(RateLimitNotice).exists()).toBe(true)
    expect(wrapper.text()).toContain('6 intentos por minuto')
    expect(wrapper.find('#email-change-error').exists()).toBe(false)
  })

  it('keeps the rate limit notice away from the email and password fields', () => {
    const wrapper = mountForm({ error: { field: 'rate-limit' } })

    expect(wrapper.get('input[type="email"]').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('input[type="password"]').attributes('aria-invalid')).toBeUndefined()
  })

  it('shows no rate limit notice for an ordinary field error', () => {
    const wrapper = mountForm({ error: { field: 'email', message: 'Ese email ya existe' } })

    expect(wrapper.findComponent(RateLimitNotice).exists()).toBe(false)
    expect(wrapper.get('#email-change-email-error').text()).toBe('Ese email ya existe')
  })

  it('offers a sign-in hint alongside an email error', () => {
    const wrapper = mountForm({ error: { field: 'email', message: 'Ese email ya existe' } })

    expect(wrapper.find('#email-change-email-hint').exists()).toBe(true)
  })

  it('offers no sign-in hint alongside a password error', () => {
    const wrapper = mountForm({ error: { field: 'password', message: 'Contraseña incorrecta' } })

    expect(wrapper.find('#email-change-email-hint').exists()).toBe(false)
  })

  it('shows a general error as a form level alert', () => {
    const wrapper = mountForm({ error: 'Probá de nuevo en unos minutos' })

    expect(wrapper.get('#email-change-error').text()).toBe('Probá de nuevo en unos minutos')
  })

  it('binds a field scoped error to the email input', () => {
    const wrapper = mountForm({ error: { field: 'email', message: 'Ese email ya existe' } })

    expect(wrapper.get('input[type="email"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#email-change-email-error').text()).toBe('Ese email ya existe')
  })

  it('binds a field scoped error to the password input', () => {
    const wrapper = mountForm({ error: { field: 'password', message: 'Contraseña incorrecta' } })

    expect(wrapper.get('input[type="password"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#email-change-password-error').text()).toBe('Contraseña incorrecta')
  })

  // jsdom does not compute layout, so these guard the shrink-enabling classes
  // rather than the rendered width. Grid items default to min-width:auto, which
  // pins the track to the input's intrinsic size and overflows the card.
  it('lets the form shrink below its content intrinsic width', () => {
    const wrapper = mountForm()

    expect(wrapper.get('form').classes()).toContain('min-w-0')
  })

  it('lets every field wrapper shrink below its content intrinsic width', () => {
    const wrapper = mountForm()

    const labels = wrapper.findAll('form label')

    expect(labels.length).toBe(2)
    labels.forEach((label) => {
      expect(label.classes()).toContain('min-w-0')
    })
  })

  it('lets the email input shrink below its intrinsic width', () => {
    const wrapper = mountForm()

    expect(wrapper.get('input[type="email"]').classes()).toContain('min-w-0')
  })

  it('disables the submit control while a change is in flight', () => {
    const wrapper = mountForm({ loading: true })

    const submit = wrapper.get('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toBe('Cambiando...')
  })
})
