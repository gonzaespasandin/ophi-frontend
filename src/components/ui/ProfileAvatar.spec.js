import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileAvatar from './ProfileAvatar.vue'

describe('ProfileAvatar', () => {
  it('shows the uppercased first letter of the name', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: 'lucía' } })

    expect(wrapper.text()).toBe('L')
  })

  it('falls back to a question mark without a name', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: '' } })

    expect(wrapper.text()).toBe('?')
  })

  it('tints itself with the profile color', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: 'Sofía', color: '#6D28D9' } })

    expect(wrapper.element.style.backgroundColor).toBe('rgb(109, 40, 217)')
  })

  it('tints itself with the brand blue when the profile has no color', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: 'Sofía', color: null } })

    expect(wrapper.element.style.backgroundColor).toBe('rgb(0, 91, 142)')
  })

  it('scales the letter with the requested size', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: 'Lucía', size: 34 } })

    expect(wrapper.element.style.width).toBe('34px')
    expect(wrapper.element.style.fontSize).toBe('15px')
  })

  it('stays out of the accessibility tree because the name is always written next to it', () => {
    const wrapper = mount(ProfileAvatar, { props: { name: 'Lucía' } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
