import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterChips from './FilterChips.vue'

const filters = [
  { id: 4, name: 'Granix' },
  { id: 7, name: 'Gallo Snack' },
]

function mountChips(props = {}) {
  return mount(FilterChips, { props: { filters, ...props } })
}

describe('FilterChips', () => {
  it('names every filter that is narrowing the list', () => {
    const wrapper = mountChips()

    expect(wrapper.text()).toContain('Granix')
    expect(wrapper.text()).toContain('Gallo Snack')
  })

  it('lets a chip remove itself', async () => {
    const wrapper = mountChips()

    await wrapper.get('[aria-label="Quitar el filtro Granix"]').trigger('click')

    expect(wrapper.emitted('remove').at(-1)).toEqual([4])
  })

  it('drops every filter at once', async () => {
    const wrapper = mountChips()

    await wrapper.get('[data-testid="clear-filters"]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('renders nothing when no filter is active', () => {
    expect(mountChips({ filters: [] }).find('[data-testid="filter-chips"]').exists()).toBe(false)
  })
})
