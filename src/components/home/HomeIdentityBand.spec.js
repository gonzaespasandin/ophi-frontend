import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeIdentityBand from './HomeIdentityBand.vue'

function mountBand(props = {}, slots = {}) {
  return mount(HomeIdentityBand, {
    props,
    slots,
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
}

describe('HomeIdentityBand', () => {
  it('greets with the first name only, so the header never wraps', () => {
    const wrapper = mountBand({ name: 'María Esperanza Gutiérrez' })

    expect(wrapper.text()).toContain('María')
    expect(wrapper.text()).not.toContain('Esperanza')
  })

  it('renders nothing but the avatar fallback when there is no name yet', () => {
    const wrapper = mountBand({ name: '' })

    expect(wrapper.get('[data-testid="profile-avatar"]').text()).toBe('?')
  })

  it('tints the avatar with the main profile color', () => {
    const wrapper = mountBand({ name: 'Lucía', avatarColor: '#6D28D9' })

    expect(wrapper.get('[data-testid="profile-avatar"]').element.style.backgroundColor)
      .toBe('rgb(109, 40, 217)')
  })

  it('labels the profile link for screen readers', () => {
    const wrapper = mountBand({ name: 'Lucía' })

    expect(wrapper.get('[aria-label="Ir a mi perfil"]').exists()).toBe(true)
  })

  it('renders the search slot below the identity row', () => {
    const wrapper = mountBand({ name: 'Lucía' }, { search: '<div>Buscar productos</div>' })

    expect(wrapper.text()).toContain('Buscar productos')
  })
})
