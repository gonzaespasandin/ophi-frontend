import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchScannerHandoff from './SearchScannerHandoff.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountHandoff() {
  return mount(SearchScannerHandoff, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('SearchScannerHandoff', () => {
  it('explains why searching by name helps everyone', () => {
    const wrapper = mountHandoff()

    expect(wrapper.text()).toContain('Buscalo por nombre y nos ayudás')
    expect(wrapper.text()).toContain('para todos')
  })

  it('offers scanning another product as a way out', () => {
    const wrapper = mountHandoff()

    expect(wrapper.get('[data-test="scan-again"]').attributes('href')).toBe('/scanner')
  })

  it('shows the suggestion action as unavailable, because there is no flow behind it yet', () => {
    const wrapper = mountHandoff()
    const suggest = wrapper.get('[data-test="suggest"]')

    expect(suggest.attributes('disabled')).toBeDefined()
    expect(suggest.attributes('aria-disabled')).toBe('true')
  })
})
