import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AvatarColorPicker from './AvatarColorPicker.vue'

const PALETTE = ['#005B8E', '#007050', '#9A3412', '#B91C1C', '#6D28D9', '#374151']

describe('AvatarColorPicker', () => {
  it('renders one radio per palette color', () => {
    const wrapper = mount(AvatarColorPicker)

    const radios = wrapper.findAll('input[type="radio"]')

    expect(radios).toHaveLength(PALETTE.length)
    expect(radios.map((radio) => radio.attributes('value'))).toEqual(PALETTE)
  })

  it('exposes an accessible name for every color', () => {
    const wrapper = mount(AvatarColorPicker)

    expect(wrapper.text()).toContain('Azul')
    expect(wrapper.text()).toContain('Violeta')
  })

  it('emits the picked color through the model', async () => {
    const wrapper = mount(AvatarColorPicker, { props: { modelValue: null } })

    await wrapper.findAll('input[type="radio"]')[4].setValue()

    expect(wrapper.emitted('update:modelValue')).toEqual([['#6D28D9']])
  })
})
