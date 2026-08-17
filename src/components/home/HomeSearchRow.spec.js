import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeSearchRow from './HomeSearchRow.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('HomeSearchRow', () => {
  it('navigates to the search screen instead of pretending to be a text field', () => {
    const wrapper = mount(HomeSearchRow, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.get('a').attributes('href')).toBe('/search')
  })

  it('reads as an action', () => {
    const wrapper = mount(HomeSearchRow, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('Buscar productos')
  })
})
