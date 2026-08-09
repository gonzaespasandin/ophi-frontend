import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import FamilyQuotaCard from './FamilyQuotaCard.vue'

function mountCard(props) {
  return mount(FamilyQuotaCard, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('FamilyQuotaCard', () => {
  it('pluralises a single remaining slot in the singular', () => {
    const wrapper = mountCard({ remainingSlots: 1 })

    expect(wrapper.text()).toContain('Te queda 1 lugar')
    expect(wrapper.text()).not.toContain('lugares')
  })

  it('pluralises several remaining slots in the plural', () => {
    const wrapper = mountCard({ remainingSlots: 3 })

    expect(wrapper.text()).toContain('Te quedan 3 lugares')
  })

  it('invites the user to add a profile while slots remain', () => {
    const wrapper = mountCard({ remainingSlots: 3 })

    expect(wrapper.text()).toContain('Sumá a tu familia')
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/add-new-profile')
    expect(wrapper.findComponent(RouterLinkStub).text()).toContain('Agregar perfil')
  })

  it('replaces the invitation with a limit notice when no slots remain', () => {
    const wrapper = mountCard({ remainingSlots: 0 })

    expect(wrapper.text()).toContain('Llegaste al máximo de perfiles')
    expect(wrapper.text()).toContain('9 de 9 usados')
    expect(wrapper.text()).not.toContain('Sumá a tu familia')
  })

  it('offers no add-profile link when the server would reject the creation', () => {
    const wrapper = mountCard({ remainingSlots: 0 })

    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Agregar perfil')
  })

  it('reports the configured maximum in the limit notice', () => {
    const wrapper = mountCard({ remainingSlots: 0, maxSlots: 4 })

    expect(wrapper.text()).toContain('4 de 4 usados')
  })
})
