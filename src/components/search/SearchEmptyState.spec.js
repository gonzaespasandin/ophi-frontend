import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchEmptyState from './SearchEmptyState.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountState(props = {}) {
  return mount(SearchEmptyState, {
    props: { query: 'zzz', ...props },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('SearchEmptyState', () => {
  it('names what was searched instead of a bare "no hay resultados"', () => {
    const wrapper = mountState({ query: 'mermelada light' })

    expect(wrapper.text()).toContain('Sin coincidencias')
    expect(wrapper.text()).toContain('mermelada light')
  })

  it('blames the database, not the person', () => {
    const wrapper = mountState()

    expect(wrapper.text()).toContain('Nuestra base todavía es chica')
  })

  it('offers the scanner as the way out', () => {
    const wrapper = mountState()

    expect(wrapper.get('[data-test="scan"]').attributes('href')).toBe('/scanner')
  })

  it('shows the suggestion action as unavailable, because there is no flow behind it yet', () => {
    const wrapper = mountState()
    const suggest = wrapper.get('[data-test="suggest"]')

    expect(suggest.attributes('disabled')).toBeDefined()
    expect(suggest.attributes('aria-disabled')).toBe('true')
  })
})
