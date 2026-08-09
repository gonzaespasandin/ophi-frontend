import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountErrorState from './AccountErrorState.vue'

describe('AccountErrorState', () => {
  it('announces the failure as an alert on insertion', () => {
    const wrapper = mount(AccountErrorState)

    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('explains that the account could not be loaded', () => {
    const wrapper = mount(AccountErrorState)

    expect(wrapper.text()).toContain('No pudimos cargar tu cuenta')
    expect(wrapper.text()).toContain('Revisá tu conexión')
  })

  it('offers a retry control after the explanation in reading order', () => {
    const wrapper = mount(AccountErrorState)

    const button = wrapper.get('button')

    expect(button.text()).toBe('Reintentar')
    expect(wrapper.text().indexOf('No pudimos cargar tu cuenta')).toBeLessThan(
      wrapper.text().indexOf('Reintentar')
    )
  })

  it('asks the parent to retry when the control is activated', async () => {
    const wrapper = mount(AccountErrorState)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('asks to retry again on a second activation', async () => {
    const wrapper = mount(AccountErrorState)

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(2)
  })

  it('does not retry on its own', () => {
    const wrapper = mount(AccountErrorState)

    expect(wrapper.emitted('retry')).toBeUndefined()
  })
})
