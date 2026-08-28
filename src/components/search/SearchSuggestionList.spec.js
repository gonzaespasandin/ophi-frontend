import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchSuggestionList from './SearchSuggestionList.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

const suggestions = [
  { id: 1, name: 'Galletitas de avena', brand: { name: 'Granix' } },
  { id: 2, name: 'Avena instantánea', brand: 'Quaker' },
]

function mountList(props = {}) {
  return mount(SearchSuggestionList, {
    props: { suggestions, query: 'avena', ...props },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('SearchSuggestionList', () => {
  it('sends each suggestion straight to its product sheet', () => {
    const wrapper = mountList()
    const links = wrapper.findAll('[data-test="suggestion"]')

    expect(links[0].attributes('href')).toBe('/product/Galletitas de avena/Granix')
    expect(links[1].attributes('href')).toBe('/product/Avena instantánea/Quaker')
  })

  it('highlights the part of the name that matched, whatever the casing', () => {
    const wrapper = mountList()
    const highlights = wrapper.findAll('[data-test="match"]')

    expect(highlights[0].text()).toBe('avena')
    expect(highlights[1].text()).toBe('Avena')
  })

  it('does not highlight anything when the query is not inside the name', () => {
    const wrapper = mountList({ suggestions: [suggestions[0]], query: 'zzz' })

    expect(wrapper.find('[data-test="match"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Galletitas de avena')
  })

  it('treats the query as text, not as a regular expression', () => {
    const wrapper = mountList({
      suggestions: [{ id: 3, name: 'Arroz (integral)', brand: 'Gallo' }],
      query: '(int',
    })

    expect(wrapper.get('[data-test="match"]').text()).toBe('(int')
  })

  it('makes the Enter action visible as its own row', () => {
    const wrapper = mountList()

    expect(wrapper.get('[data-test="see-all"]').text()).toContain(
      'Ver todos los resultados de «avena»'
    )
  })

  it('runs the full search from that row', async () => {
    const wrapper = mountList()

    await wrapper.get('[data-test="see-all"]').trigger('click')

    expect(wrapper.emitted('see-all')).toHaveLength(1)
  })

  it('keeps offering the full search even before any suggestion arrives', () => {
    const wrapper = mountList({ suggestions: [] })

    expect(wrapper.findAll('[data-test="suggestion"]')).toHaveLength(0)
    expect(wrapper.find('[data-test="see-all"]').exists()).toBe(true)
  })
})
