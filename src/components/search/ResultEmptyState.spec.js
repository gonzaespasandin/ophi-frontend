import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultEmptyState from './ResultEmptyState.vue'
import ResultFilteredEmptyState from './ResultFilteredEmptyState.vue'
import ResultErrorCard from './ResultErrorCard.vue'

const RouterLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

describe('ResultEmptyState', () => {
  function mountState(props = {}) {
    return mount(ResultEmptyState, {
      props: { query: 'mermelada light', ...props },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
  }

  // "¡Lo sentimos!" said nothing and took the headline slot; the copy now names
  // what was searched and admits the database is the problem.
  it('names what was searched and blames the catalogue, not the person', () => {
    const wrapper = mountState()

    expect(wrapper.text()).toContain('No lo tenemos cargado')
    expect(wrapper.text()).toContain('mermelada light')
    expect(wrapper.text()).not.toContain('¡Lo sentimos!')
  })

  it('offers to correct the search', async () => {
    const wrapper = mountState()

    await wrapper.get('[data-testid="edit-search"]').trigger('click')

    expect(wrapper.emitted('edit-search')).toHaveLength(1)
  })

  it('sends the person to the scanner, the main road into the app', () => {
    expect(mountState().get('[data-testid="scan"]').attributes('href')).toBe('/scanner')
  })

  // There is no endpoint behind suggesting a product yet, so the button is
  // drawn where the design puts it and left off.
  it('shows the suggestion offer switched off rather than inventing a flow', () => {
    const button = mountState().get('[data-testid="suggest"]')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-disabled')).toBe('true')
  })
})

describe('ResultFilteredEmptyState', () => {
  function mountState() {
    return mount(ResultFilteredEmptyState, { props: { query: 'galletitas' } })
  }

  // The difference with the empty catalogue: here the products do exist and the
  // person is hiding them, so the exit is removing filters, not suggesting.
  it('blames the filters, not the catalogue', () => {
    const wrapper = mountState()

    expect(wrapper.text()).toContain('Ningún resultado con esos filtros')
    expect(wrapper.text()).toContain('galletitas')
    expect(wrapper.find('[data-testid="suggest"]').exists()).toBe(false)
  })

  it('offers both exits: drop the filters or go back and adjust them', async () => {
    const wrapper = mountState()

    await wrapper.get('[data-testid="clear-filters"]').trigger('click')
    await wrapper.get('[data-testid="adjust-filters"]').trigger('click')

    expect(wrapper.emitted('clear-filters')).toHaveLength(1)
    expect(wrapper.emitted('adjust-filters')).toHaveLength(1)
  })
})

describe('ResultErrorCard', () => {
  it('offers to try again instead of dead-ending', async () => {
    const wrapper = mount(ResultErrorCard)

    expect(wrapper.text()).toContain('No pudimos buscar')

    await wrapper.get('[data-testid="retry"]').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
