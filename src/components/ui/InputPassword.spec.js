import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InputPassword from './InputPassword.vue'

const field = wrapper => wrapper.get('[data-testid="password-field"]')

describe('InputPassword', () => {
  // jsdom does not compute layout, so these guard the shrink-enabling classes
  // rather than the rendered width. A flex item defaults to min-width:auto,
  // which pins the row to the input's intrinsic size and overflows its parent.
  it('lets the field shrink below its content intrinsic width', () => {
    const wrapper = mount(InputPassword)

    expect(field(wrapper).classes()).toContain('min-w-0')
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

  // A single "Mostrar / Ocultar" label never tells you which one pressing it does.
  it('names what the toggle will do next', async () => {
    const wrapper = mount(InputPassword)

    expect(wrapper.get('button').attributes('aria-label')).toBe('Mostrar contraseña')

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').attributes('aria-label')).toBe('Ocultar contraseña')
  })

  it('carries the error border on the field itself, not only on the message below', () => {
    const wrapper = mount(InputPassword, { props: { invalid: true } })

    expect(field(wrapper).classes()).toContain('border-ophi-danger')
  })

  describe('on the blue band', () => {
    it('matches the height of the other fields on the band', () => {
      const wrapper = mount(InputPassword)

      expect(wrapper.get('input').classes()).toContain('h-12')
    })

    it('leans on the white fill for its edge so it reads as a field on blue', () => {
      const wrapper = mount(InputPassword)

      expect(field(wrapper).classes()).toContain('border-transparent')
    })
  })

  describe('on a light card', () => {
    it('matches the height of the other fields on the profile cards', () => {
      const wrapper = mount(InputPassword, { props: { tone: 'light' } })

      expect(wrapper.get('input').classes()).toContain('h-11')
    })

    // White on white has no edge of its own: without a drawn border the field
    // is invisible on the profile card.
    it('draws its own border so it does not vanish on white', () => {
      const wrapper = mount(InputPassword, { props: { tone: 'light' } })

      expect(field(wrapper).classes()).toContain('border-gray-300')
    })
  })

  // The inner input is outline:none so the eye button can share one rounded
  // box with it. That only works if the box itself takes over the focus ring —
  // otherwise tabbing into the password field shows nothing at all.
  describe('focus indicator', () => {
    it('shows a focus ring on the band', () => {
      const wrapper = mount(InputPassword)

      expect(field(wrapper).classes()).toContain('focus-within:outline-white')
      expect(field(wrapper).classes()).toContain('focus-within:outline-2')
    })

    it('shows a focus ring on a light card', () => {
      const wrapper = mount(InputPassword, { props: { tone: 'light' } })

      expect(field(wrapper).classes()).toContain('focus-within:outline-ophi-blue')
      expect(field(wrapper).classes()).toContain('focus-within:outline-2')
    })
  })
})
