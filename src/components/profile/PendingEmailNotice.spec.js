import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PendingEmailNotice from './PendingEmailNotice.vue'

function mountNotice(email = 'nueva@ophi.app') {
  return mount(PendingEmailNotice, { props: { email } })
}

describe('PendingEmailNotice', () => {
  it('announces the pending confirmation politely', () => {
    const wrapper = mountNotice()

    expect(wrapper.attributes('role')).toBe('status')
  })

  it('shows the address waiting for confirmation', () => {
    const wrapper = mountNotice('nueva@ophi.app')

    expect(wrapper.text()).toContain('nueva@ophi.app')
  })

  it('shows a different pending address unchanged', () => {
    const wrapper = mountNotice('otra.direccion@ophi.app')

    expect(wrapper.text()).toContain('otra.direccion@ophi.app')
    expect(wrapper.text()).not.toContain('nueva@ophi.app')
  })

  it('explains that the current email still works', () => {
    const wrapper = mountNotice()

    expect(wrapper.text()).toContain('seguís ingresando con tu email actual')
  })

  it('presents the resend control as unavailable in both ways', () => {
    const wrapper = mountNotice()

    const button = wrapper.get('button')

    expect(button.text()).toContain('Reenviar link')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-disabled')).toBe('true')
  })

  it('tells the user the resend is not available yet', () => {
    const wrapper = mountNotice()

    expect(wrapper.text()).toContain('Próximamente')
  })

  it('emits nothing when the inert resend control is clicked', async () => {
    const wrapper = mountNotice()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted()).toEqual({})
  })
})
