import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import FamilyCtaCard from './FamilyCtaCard.vue'

function mountCard(variant) {
  return mount(FamilyCtaCard, {
    props: { variant },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('FamilyCtaCard', () => {
  it('invites a premium user with no family profiles to create the first one', () => {
    const wrapper = mountCard('empty')

    expect(wrapper.text()).toContain('Aún no tenés perfiles familiares')
    expect(wrapper.text()).toContain('Crear primer perfil')
  })

  it('routes the empty variant to the profile creation screen', () => {
    const wrapper = mountCard('empty')

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/add-new-profile')
  })

  it('upsells premium instead of offering a creation the server would reject', () => {
    const wrapper = mountCard('upgrade')

    expect(wrapper.text()).toContain('premium')
    expect(wrapper.text()).toContain('Hacerme premium')
    expect(wrapper.text()).not.toContain('Crear primer perfil')
  })

  it('routes the upgrade variant to the subscriptions screen', () => {
    const wrapper = mountCard('upgrade')

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/subscriptions')
  })

  it('renders exactly one call to action per variant', () => {
    expect(mountCard('empty').findAllComponents(RouterLinkStub)).toHaveLength(1)
    expect(mountCard('upgrade').findAllComponents(RouterLinkStub)).toHaveLength(1)
  })
})
