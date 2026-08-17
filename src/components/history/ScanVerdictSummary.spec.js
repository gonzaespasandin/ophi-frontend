import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanVerdictSummary from './ScanVerdictSummary.vue'

function result(id, name, isSafe, unsafeIngredients = [], overrides = {}) {
  return {
    id,
    is_safe: isSafe,
    unsafe_ingredients: unsafeIngredients,
    profile: { id, name, avatar_color: '#005B8E' },
    ...overrides,
  }
}

function mountSummary(results) {
  return mount(ScanVerdictSummary, { props: { results } })
}

describe('ScanVerdictSummary', () => {
  describe('with a single profile', () => {
    it('speaks directly to the person when the product is safe', () => {
      const wrapper = mountSummary([result(1, 'Lucía', true)])

      expect(wrapper.text()).toContain('Apto para vos')
      expect(wrapper.text()).toContain('Ningún ingrediente de tu lista.')
    })

    it('lists the offending ingredients when the product is not safe', () => {
      const wrapper = mountSummary([result(1, 'Lucía', false, ['Gluten', 'Maní'])])

      expect(wrapper.text()).toContain('No apto para vos')
      expect(wrapper.text()).toContain('Gluten · Maní')
    })
  })

  describe('with several profiles', () => {
    const manyResults = [
      result(1, 'Lucía', true),
      result(2, 'Joaquín', true),
      result(3, 'Sofía', true),
      result(4, 'Pedro', true),
      result(5, 'Valentina', true),
      result(6, 'Tomás', true),
      result(7, 'Martina', false, ['Frutos secos', 'Maní']),
      result(8, 'Nicolás', false, ['Gluten']),
    ]

    it('collapses the safe profiles into a count instead of a list', () => {
      const wrapper = mountSummary(manyResults)

      expect(wrapper.text()).toContain('Apto para 6 perfiles')
    })

    it('shows only the first four chips and offers the rest behind a toggle', () => {
      const wrapper = mountSummary(manyResults)

      expect(wrapper.text()).toContain('Lucía')
      expect(wrapper.text()).not.toContain('Valentina')
      expect(wrapper.text()).toContain('+2 más')
    })

    it('reveals the remaining profiles when the toggle is pressed', async () => {
      const wrapper = mountSummary(manyResults)

      await wrapper.get('button').trigger('click')

      expect(wrapper.text()).toContain('Valentina')
      expect(wrapper.text()).toContain('Ver menos')
    })

    it('does not offer a toggle when every safe profile already fits', () => {
      const wrapper = mountSummary([
        result(1, 'Lucía', true),
        result(2, 'Joaquín', true),
        result(3, 'Martina', false, ['Gluten']),
      ])

      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('details every unsafe profile with its conflicting ingredients', () => {
      const wrapper = mountSummary(manyResults)

      expect(wrapper.text()).toContain('No apto para 2 perfiles')
      expect(wrapper.text()).toContain('Martina')
      expect(wrapper.text()).toContain('Frutos secos · Maní')
      expect(wrapper.text()).toContain('Nicolás')
      expect(wrapper.text()).toContain('Gluten')
    })

    it('singularises the heading when a single profile falls in a group', () => {
      const wrapper = mountSummary([
        result(1, 'Lucía', true),
        result(2, 'Martina', false, ['Gluten']),
      ])

      expect(wrapper.text()).toContain('Apto para 1 perfil')
      expect(wrapper.text()).toContain('No apto para 1 perfil')
    })

    it('omits the safe group entirely when nobody can eat the product', () => {
      const wrapper = mountSummary([
        result(1, 'Lucía', false, ['Gluten']),
        result(2, 'Martina', false, ['Maní']),
      ])

      expect(wrapper.text()).not.toContain('Apto para')
      expect(wrapper.text()).toContain('No apto para 2 perfiles')
    })

    it('falls back to the stored profile name when the profile was deleted', () => {
      const wrapper = mountSummary([
        result(1, 'Lucía', true),
        { id: 2, is_safe: true, unsafe_ingredients: [], profile: null, profile_name: 'Joaquín' },
      ])

      expect(wrapper.text()).toContain('Joaquín')
    })
  })
})
