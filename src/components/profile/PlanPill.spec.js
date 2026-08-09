import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import PlanPill from './PlanPill.vue'

function mountPill(props) {
  return mount(PlanPill, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('PlanPill', () => {
  it('shows the premium management copy for a premium user', () => {
    const wrapper = mountPill({ isPremium: true })

    expect(wrapper.text()).toContain('PREMIUM · gestionar')
    expect(wrapper.text()).not.toContain('GRATUITO')
  })

  it('shows the upgrade copy for a free user', () => {
    const wrapper = mountPill({ isPremium: false })

    expect(wrapper.text()).toContain('GRATUITO · mejorar')
    expect(wrapper.text()).not.toContain('PREMIUM')
  })

  it('links to the subscriptions screen for a premium user', () => {
    const wrapper = mountPill({ isPremium: true })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/subscriptions')
  })

  it('links to the subscriptions screen for a free user', () => {
    const wrapper = mountPill({ isPremium: false })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/subscriptions')
  })
})
