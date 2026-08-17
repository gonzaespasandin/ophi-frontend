import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductIngredientsCard from './ProductIngredientsCard.vue'

const martina = { id: 1, name: 'Martina', avatar_color: '#B91C1C' }
const nicolas = { id: 2, name: 'Nicolás', avatar_color: '#007050' }

const conflicts = [
  { id: 100, name: 'Almendras molidas', restrictions: ['Frutos secos'], profiles: [martina] },
  { id: 101, name: 'Harina de trigo', restrictions: ['Gluten'], profiles: [nicolas] },
]

function mountCard(props) {
  return mount(ProductIngredientsCard, {
    props: { conflicts: [], traces: [], cleanIngredients: [], filterProfiles: [], ...props },
  })
}

describe('ProductIngredientsCard', () => {
  it('leads with the conflicts and what each one collides with', () => {
    const wrapper = mountCard({ conflicts })

    expect(wrapper.text()).toContain('2 ingredientes en conflicto')
    expect(wrapper.text()).toContain('Almendras molidas')
    expect(wrapper.text()).toContain('Choca con "Frutos secos" de Martina')
  })

  it('drops the name when there is a single profile to talk about', () => {
    const wrapper = mountCard({ conflicts: [conflicts[0]], singleProfile: true })

    expect(wrapper.text()).toContain('Choca con "Frutos secos"')
    expect(wrapper.text()).not.toContain('de Martina')
  })

  it('counts one conflict in the singular', () => {
    expect(mountCard({ conflicts: [conflicts[0]] }).text()).toContain('1 ingrediente en conflicto')
  })

  it('says so when the list is clean', () => {
    const wrapper = mountCard({ cleanIngredients: ['Agua', 'Sal'] })

    expect(wrapper.text()).toContain('Sin conflictos con tu lista')
  })

  // Traces are a risk of another nature, so they never blend into the conflicts.
  it('keeps the traces in their own block', () => {
    const wrapper = mountCard({ traces: [{ id: 5, name: 'Maní', restrictions: [], profiles: [] }] })

    const traces = wrapper.get('[data-testid="traces"]')

    expect(traces.text()).toContain('Puede contener trazas')
    expect(traces.text()).toContain('Maní')
  })

  it('folds the ingredients nobody has to worry about', async () => {
    const wrapper = mountCard({ conflicts, cleanIngredients: ['Agua', 'Azúcar mascabo', 'Sal'] })

    const toggle = wrapper.get('[data-testid="toggle-clean-ingredients"]')

    expect(toggle.text()).toContain('Ver los 3 ingredientes sin conflictos')
    expect(wrapper.text()).not.toContain('Azúcar mascabo')

    await toggle.trigger('click')

    expect(wrapper.text()).toContain('Agua, Azúcar mascabo, Sal')
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })

  it('filters the conflicts down to one profile', async () => {
    const wrapper = mountCard({ conflicts, filterProfiles: [martina, nicolas], modelValue: null })

    await wrapper.get(`[data-testid="filter-${martina.id}"]`).trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[1]])

    await wrapper.get('[data-testid="filter-all"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')[1]).toEqual([null])
  })

  it('only offers the filter when there is more than one profile to filter by', () => {
    expect(mountCard({ conflicts, filterProfiles: [martina] }).find('[data-testid="filter-all"]').exists())
      .toBe(false)
  })

  it('drops the filter when the product is fine for everybody', () => {
    const wrapper = mountCard({
      conflicts: [],
      totalConflicts: 0,
      filterProfiles: [martina, nicolas],
      cleanIngredients: ['Agua', 'Sal'],
    })

    expect(wrapper.text()).not.toContain('Ver conflictos de')
    expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(false)
  })

  // Filtering down to a profile with nothing to show must not remove the very
  // control that got the user there.
  it('keeps the filter alive when a filtered profile comes up clean', () => {
    const wrapper = mountCard({
      conflicts: [],
      totalConflicts: 2,
      filterProfiles: [martina, nicolas],
      modelValue: 2,
    })

    expect(wrapper.get('[data-testid="filter-all"]').exists()).toBe(true)
  })

  it('marks the pressed filter', () => {
    const wrapper = mountCard({ conflicts, filterProfiles: [martina, nicolas], modelValue: 1 })

    expect(wrapper.get(`[data-testid="filter-${martina.id}"]`).attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="filter-all"]').attributes('aria-pressed')).toBe('false')
  })

  it('asks for the list instead of pretending it has one', () => {
    const wrapper = mountCard({ hasIngredients: false })

    expect(wrapper.text()).toContain('Todavía no tenemos la lista')
    expect(wrapper.find('[data-testid="toggle-clean-ingredients"]').exists()).toBe(false)
  })
})
