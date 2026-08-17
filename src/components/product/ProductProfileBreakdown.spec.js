import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductProfileBreakdown from './ProductProfileBreakdown.vue'

const unsafe = [
  { id: 1, name: 'Martina', avatar_color: '#B91C1C', restrictions: ['Frutos secos', 'Maní'] },
  { id: 2, name: 'Nicolás', avatar_color: '#007050', restrictions: ['Gluten'] },
]

const safe = [
  { id: 3, name: 'Lucía', avatar_color: '#005B8E' },
  { id: 4, name: 'Joaquín', avatar_color: '#9A3412' },
  { id: 5, name: 'Sofía', avatar_color: '#6D28D9' },
  { id: 6, name: 'Pedro', avatar_color: '#374151' },
]

const unrestricted = [
  { id: 7, name: 'Valentina' },
  { id: 8, name: 'Tomás' },
]

function mountBreakdown(props) {
  return mount(ProductProfileBreakdown, {
    props: { unsafeProfiles: [], safeProfiles: [], unrestrictedProfiles: [], ...props },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('ProductProfileBreakdown', () => {
  it('leads with who cannot eat it and the restriction each one hit', () => {
    const wrapper = mountBreakdown({ unsafeProfiles: unsafe })

    expect(wrapper.text()).toContain('No apto para 2 perfiles')
    expect(wrapper.text()).toContain('Martina')
    expect(wrapper.text()).toContain('Frutos secos')
    expect(wrapper.text()).toContain('Maní')
    expect(wrapper.text()).toContain('Gluten')
  })

  it('keeps the singular honest', () => {
    const wrapper = mountBreakdown({ unsafeProfiles: [unsafe[0]], safeProfiles: [safe[0]] })

    expect(wrapper.text()).toContain('No apto para 1 perfil')
    expect(wrapper.text()).toContain('Apto para 1 perfil')
  })

  // Four names would push the ingredients below the fold, so the group folds
  // and opens on demand.
  it('folds the cleared profiles after the first two', async () => {
    const wrapper = mountBreakdown({ safeProfiles: safe })

    expect(wrapper.text()).toContain('Lucía')
    expect(wrapper.text()).not.toContain('Sofía')

    const toggle = wrapper.get('[data-testid="toggle-safe-profiles"]')

    expect(toggle.text()).toBe('+2 más')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')

    expect(wrapper.text()).toContain('Sofía')
    expect(toggle.text()).toBe('Ver menos')
  })

  it('does not offer a toggle when everybody already fits', () => {
    const wrapper = mountBreakdown({ safeProfiles: safe.slice(0, 2) })

    expect(wrapper.find('[data-testid="toggle-safe-profiles"]').exists()).toBe(false)
  })

  it('sets apart the profiles with nothing loaded to compare against', () => {
    const wrapper = mountBreakdown({ safeProfiles: safe, unrestrictedProfiles: unrestricted })

    const note = wrapper.get('[data-testid="unrestricted-profiles"]')

    expect(note.text()).toContain('Sin restricciones cargadas')
    expect(note.text()).toContain('Valentina, Tomás')
    expect(note.attributes('href')).toBe('/profile')
  })

  it('stays quiet about groups that have nobody in them', () => {
    const wrapper = mountBreakdown({ unsafeProfiles: unsafe })

    expect(wrapper.text()).not.toContain('Apto para')
    expect(wrapper.find('[data-testid="unrestricted-profiles"]').exists()).toBe(false)
  })
})
