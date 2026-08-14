import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InputPassword from './InputPassword.vue'

describe('InputPassword', () => {
  // jsdom does not compute layout, so these guard the shrink-enabling classes
  // rather than the rendered width. A flex item defaults to min-width:auto,
  // which pins the row to the input's intrinsic size and overflows its parent.
  it('lets the field shrink below its content intrinsic width', () => {
    const wrapper = mount(InputPassword)

    expect(wrapper.get('div').classes()).toContain('min-w-0')
  })

  it('lets the inner input shrink below its intrinsic width', () => {
    const wrapper = mount(InputPassword)

    expect(wrapper.get('input').classes()).toContain('min-w-0')
  })

  it('toggles the input between hidden and visible text', async () => {
    const wrapper = mount(InputPassword)

    expect(wrapper.get('input').attributes('type')).toBe('password')

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('input').attributes('type')).toBe('text')
  })
})
