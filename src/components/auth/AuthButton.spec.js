import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthButton from './AuthButton.vue'

describe('AuthButton', () => {
  it('renders its label', () => {
    const wrapper = mount(AuthButton, { slots: { default: 'Empezar' } })

    expect(wrapper.text()).toContain('Empezar')
  })

  it('swaps the label while loading so the wait is named', () => {
    const wrapper = mount(AuthButton, {
      props: { loading: true, loadingLabel: 'Iniciando…' },
      slots: { default: 'Iniciar sesión' },
    })

    expect(wrapper.text()).toContain('Iniciando…')
    expect(wrapper.text()).not.toContain('Iniciar sesión')
  })

  // A second submit while the first is in flight creates a duplicate account,
  // so loading has to disable the button, not just relabel it.
  it('blocks a second press while loading', () => {
    const wrapper = mount(AuthButton, { props: { loading: true } })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('stays disabled when explicitly disabled', () => {
    const wrapper = mount(AuthButton, { props: { disabled: true } })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('does not submit the surrounding form unless asked to', () => {
    const wrapper = mount(AuthButton)

    expect(wrapper.get('button').attributes('type')).toBe('button')
  })
})
