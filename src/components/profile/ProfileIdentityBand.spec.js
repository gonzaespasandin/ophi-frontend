import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileIdentityBand from './ProfileIdentityBand.vue'

function mountBand(props) {
  return mount(ProfileIdentityBand, {
    props,
    global: { stubs: { PlanPill: true } },
  })
}

describe('ProfileIdentityBand', () => {
  it('builds the avatar initial from the first letter of the name', () => {
    const wrapper = mountBand({ name: 'lucia', email: 'lucia@ophi.app' })

    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('L')
  })

  it('falls back to a question mark when there is no name yet', () => {
    const wrapper = mountBand({ name: '', email: 'lucia@ophi.app' })

    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('?')
  })

  it('tints the avatar with the saved avatar color', () => {
    const wrapper = mountBand({ name: 'Lucía', email: 'lucia@ophi.app', avatarColor: '#6D28D9' })

    expect(wrapper.get('[aria-hidden="true"]').element.style.backgroundColor).toBe('rgb(109, 40, 217)')
  })

  it('tints the avatar with the brand blue by default', () => {
    const wrapper = mountBand({ name: 'Lucía', email: 'lucia@ophi.app' })

    expect(wrapper.get('[aria-hidden="true"]').element.style.backgroundColor).toBe('rgb(0, 91, 142)')
  })

  it('renders the profile name', () => {
    const wrapper = mountBand({ name: 'Lucía Méndez', email: 'lucia@ophi.app' })

    expect(wrapper.text()).toContain('Lucía Méndez')
  })

  it('shows the account email once it is available', () => {
    const wrapper = mountBand({
      name: 'Lucía',
      email: 'lucia@ophi.app',
      fallbackEmail: 'viejo@ophi.app',
    })

    expect(wrapper.text()).toContain('lucia@ophi.app')
    expect(wrapper.text()).not.toContain('viejo@ophi.app')
  })

  it('shows the fallback email while the account has not resolved', () => {
    const wrapper = mountBand({
      name: 'Lucía',
      email: null,
      fallbackEmail: 'sesion@ophi.app',
    })

    expect(wrapper.text()).toContain('sesion@ophi.app')
  })

  it('renders the tabs slot', () => {
    const wrapper = mount(ProfileIdentityBand, {
      props: { name: 'Lucía', email: 'lucia@ophi.app' },
      slots: { tabs: '<div>Selector de contexto</div>' },
      global: { stubs: { PlanPill: true } },
    })

    expect(wrapper.text()).toContain('Selector de contexto')
  })
})
