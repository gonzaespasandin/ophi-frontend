import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import FamilyProfileCard from './FamilyProfileCard.vue'

const named = (...names) => names.map((name, index) => ({ id: index + 1, name }))

function mountCard(profile) {
  return mount(FamilyProfileCard, {
    props: { profile },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

const MARTINA = {
  id: 7,
  name: 'Martina',
  avatar_color: '#6D28D9',
  ingredients: named('Maní', 'Frutos secos', 'Lactosa'),
}

describe('FamilyProfileCard', () => {
  it('renders the profile name', () => {
    const wrapper = mountCard(MARTINA)

    expect(wrapper.text()).toContain('Martina')
  })

  it('previews the first two restrictions', () => {
    const wrapper = mountCard(MARTINA)

    expect(wrapper.text()).toContain('Maní, Frutos secos')
  })

  it('counts the hidden restrictions when there are five', () => {
    const wrapper = mountCard({
      ...MARTINA,
      ingredients: named('Maní', 'Frutos secos', 'Lactosa', 'Huevo', 'Soja'),
    })

    expect(wrapper.text()).toContain('y 3 más')
    expect(wrapper.text()).not.toContain('Lactosa')
  })

  it('omits the truncation hint with exactly two restrictions', () => {
    const wrapper = mountCard({ ...MARTINA, ingredients: named('Lactosa', 'Huevo') })

    expect(wrapper.text()).toContain('Lactosa, Huevo')
    expect(wrapper.text()).not.toContain('más')
  })

  it('links the edit action to the profile restrictions editor', () => {
    const wrapper = mountCard(MARTINA)

    const link = wrapper.findComponent(RouterLinkStub)

    expect(link.props('to')).toBe('/profile/7/edit')
    expect(link.text()).toContain('Editar')
  })

  it('names the edit action after the profile so repeated actions stay distinguishable', () => {
    const wrapper = mountCard(MARTINA)

    expect(wrapper.findComponent(RouterLinkStub).attributes('aria-label')).toBe('Editar a Martina')
  })

  it('emits delete with the whole profile when the delete action is activated', async () => {
    const wrapper = mountCard(MARTINA)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')[0]).toEqual([MARTINA])
  })

  it('names the delete action after the profile', () => {
    const wrapper = mountCard(MARTINA)

    expect(wrapper.get('button').attributes('aria-label')).toBe('Eliminar a Martina')
  })

  it('renders the avatar initial tinted with the stored avatar colour', () => {
    const wrapper = mountCard(MARTINA)

    const avatar = wrapper.get('[data-testid="family-avatar"]')

    expect(avatar.text()).toBe('M')
    expect(avatar.attributes('style')).toContain('background-color: rgb(109, 40, 217)')
  })

  it('falls back to the institutional blue when the profile has no avatar colour', () => {
    const wrapper = mountCard({ ...MARTINA, avatar_color: null })

    expect(wrapper.get('[data-testid="family-avatar"]').attributes('style')).toContain(
      'background-color: rgb(0, 91, 142)'
    )
  })

  it('explains the absence of restrictions instead of rendering an empty line', () => {
    const wrapper = mountCard({ ...MARTINA, ingredients: [] })

    expect(wrapper.text()).toContain('Sin restricciones cargadas')
  })

  it('survives a profile payload without an ingredients array', () => {
    const wrapper = mountCard({ id: 7, name: 'Martina', avatar_color: '#6D28D9' })

    expect(wrapper.text()).toContain('Sin restricciones cargadas')
  })

  it('roots at a list item so the card list stays a real list', () => {
    const wrapper = mountCard(MARTINA)

    expect(wrapper.element.tagName).toBe('LI')
  })
})
