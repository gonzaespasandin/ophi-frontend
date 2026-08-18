import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthTextField from './AuthTextField.vue'

const baseProps = { id: 'email', label: 'Email' }

describe('AuthTextField', () => {
  it('ties the visible label to the input', () => {
    const wrapper = mount(AuthTextField, { props: baseProps })

    expect(wrapper.get('label').attributes('for')).toBe('email')
    expect(wrapper.get('input').attributes('id')).toBe('email')
  })

  it('emits what the person types', async () => {
    const wrapper = mount(AuthTextField, { props: baseProps })

    await wrapper.get('input').setValue('lucia@ophi.app')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['lucia@ophi.app'])
  })

  it('shows no error message while the field is valid', () => {
    const wrapper = mount(AuthTextField, { props: baseProps })

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
  })

  // The red chip below the field is not enough on its own: the input itself
  // carries the error border, and assistive tech needs aria-invalid to match.
  it('marks the input as invalid and announces the message', () => {
    const wrapper = mount(AuthTextField, {
      props: { ...baseProps, error: 'El email debe contener @' },
    })

    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toContain('El email debe contener @')
  })

  it('points the input at its error message for screen readers', () => {
    const wrapper = mount(AuthTextField, {
      props: { ...baseProps, error: 'El email es obligatorio' },
    })

    expect(wrapper.get('input').attributes('aria-describedby')).toBe('email-error')
    expect(wrapper.get('[role="alert"]').attributes('id')).toBe('email-error')
  })
})
