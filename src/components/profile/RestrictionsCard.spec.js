import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import RestrictionsCard from './RestrictionsCard.vue'

function mountCard(props) {
  return mount(RestrictionsCard, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

const named = (...names) => names.map((name, index) => ({ id: index + 1, name }))

describe('RestrictionsCard', () => {
  it('lists a single restriction without a truncation hint', () => {
    const wrapper = mountCard({ profileId: 7, ingredients: named('Gluten') })

    expect(wrapper.text()).toContain('Gluten')
    expect(wrapper.text()).not.toContain('más')
  })

  it('lists exactly two restrictions without a truncation hint', () => {
    const wrapper = mountCard({ profileId: 7, ingredients: named('Gluten', 'Lactosa') })

    expect(wrapper.text()).toContain('Gluten, Lactosa')
    expect(wrapper.text()).not.toContain('más')
  })

  it('truncates to two names and counts the rest', () => {
    const wrapper = mountCard({
      profileId: 7,
      ingredients: named('Gluten', 'Lactosa', 'Maní', 'Huevo', 'Soja'),
    })

    expect(wrapper.text()).toContain('Gluten, Lactosa')
    expect(wrapper.text()).toContain('y 3 más')
    expect(wrapper.text()).not.toContain('Maní')
  })

  it('links the populated row to the profile restrictions editor', () => {
    const wrapper = mountCard({ profileId: 7, ingredients: named('Gluten', 'Lactosa') })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/profile/7/edit')
  })

  it('offers an add-restrictions action when the profile has none', () => {
    const wrapper = mountCard({ profileId: 7, ingredients: [] })

    expect(wrapper.text()).toContain('Agregar restricciones')
    expect(wrapper.text()).not.toContain('Toca para editar')
  })

  it('links the empty state to the same restrictions editor', () => {
    const wrapper = mountCard({ profileId: 12, ingredients: [] })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/profile/12/edit')
  })

  it('renders the restriction card heading', () => {
    const wrapper = mountCard({ profileId: 7, ingredients: [] })

    expect(wrapper.get('h2').text()).toBe('Restricción alimenticia')
  })
})
