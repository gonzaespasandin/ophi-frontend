import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountActions from './AccountActions.vue'

describe('AccountActions', () => {
  it('announces the payments row as disabled', () => {
    const wrapper = mount(AccountActions)

    const paymentsRow = wrapper.get('[aria-disabled="true"]')

    expect(paymentsRow.text()).toContain('Historial de pagos')
  })

  it('keeps the payments row out of the tab order and off interactive elements', () => {
    const wrapper = mount(AccountActions)

    const paymentsRow = wrapper.get('[aria-disabled="true"]')

    expect(paymentsRow.element.tagName).toBe('DIV')
    expect(paymentsRow.attributes('tabindex')).toBeUndefined()
  })

  it('does not advertise the payments feature as coming soon', () => {
    const wrapper = mount(AccountActions)

    expect(wrapper.text()).not.toContain('Próximamente')
  })

  it('starts no flow when the disabled payments row is clicked', async () => {
    const wrapper = mount(AccountActions)

    await wrapper.get('[aria-disabled="true"]').trigger('click')

    expect(wrapper.emitted('logout')).toBeUndefined()
  })

  it('asks the parent to start the logout flow once per click', async () => {
    const wrapper = mount(AccountActions)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('logout')).toHaveLength(1)
  })

  it('labels the logout control in Spanish', () => {
    const wrapper = mount(AccountActions)

    expect(wrapper.get('button').text()).toContain('Cerrar sesión')
  })
})
