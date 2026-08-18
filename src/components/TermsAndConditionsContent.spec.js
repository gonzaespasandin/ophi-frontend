import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TermsAndConditionsContent from './TermsAndConditionsContent.vue'

describe('TermsAndConditionsContent', () => {
  // It is placed inside a card that already scrolls it to the height available.
  // A cap or an overflow of its own turns one document into two scrollbars.
  it('does not box the legal text in a scroll region of its own', () => {
    const wrapper = mount(TermsAndConditionsContent)
    const root = wrapper.element

    expect(root.className).not.toMatch(/max-h-/)
    expect(root.className).not.toMatch(/overflow-/)
  })

  it('renders the legal text', () => {
    const wrapper = mount(TermsAndConditionsContent)

    expect(wrapper.text()).toContain('Términos y Condiciones')
  })
})
