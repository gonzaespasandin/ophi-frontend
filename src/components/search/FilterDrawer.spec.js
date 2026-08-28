import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterDrawer from './FilterDrawer.vue'

const brands = [
  { id: 4, name: 'Granix' },
  { id: 7, name: 'Gallo Snack' },
  { id: 9, name: 'Jorgito' },
]

function mountDrawer(props = {}) {
  return mount(FilterDrawer, {
    props: { open: true, brands, selected: [], ...props },
    attachTo: document.body,
  })
}

function chip(wrapper, name) {
  return wrapper.findAll('[data-testid="brand-chip"]').find((node) => node.text().includes(name))
}

describe('FilterDrawer', () => {
  it('renders nothing while it is closed', () => {
    expect(mountDrawer({ open: false }).find('[data-testid="filter-drawer"]').exists()).toBe(false)
  })

  it('lists the brands it was handed', () => {
    const wrapper = mountDrawer()

    expect(wrapper.findAll('[data-testid="brand-chip"]')).toHaveLength(3)
  })

  it('marks the brands already filtering the list as pressed', () => {
    const wrapper = mountDrawer({ selected: [brands[0]] })

    expect(chip(wrapper, 'Granix').attributes('aria-pressed')).toBe('true')
    expect(chip(wrapper, 'Jorgito').attributes('aria-pressed')).toBe('false')
  })

  // Nothing reaches the list until "Aplicar": tapping chips is a draft, so a
  // person can change their mind and cancel out.
  it('keeps the picks as a draft until they are applied', async () => {
    const wrapper = mountDrawer()

    await chip(wrapper, 'Granix').trigger('click')

    expect(wrapper.emitted('apply')).toBeUndefined()

    await wrapper.get('[data-testid="apply-filters"]').trigger('click')

    expect(wrapper.emitted('apply').at(-1)).toEqual([[brands[0]]])
  })

  it('throws the draft away when the drawer is cancelled', async () => {
    const wrapper = mountDrawer({ selected: [brands[0]] })

    await chip(wrapper, 'Jorgito').trigger('click')
    await wrapper.get('[data-testid="cancel-filters"]').trigger('click')

    expect(wrapper.emitted('apply')).toBeUndefined()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('rebuilds the draft from the applied filters every time it opens', async () => {
    const wrapper = mountDrawer({ open: false, selected: [brands[0]] })

    await wrapper.setProps({ open: true })

    expect(chip(wrapper, 'Granix').attributes('aria-pressed')).toBe('true')
  })

  it('unpicks a brand that was already picked', async () => {
    const wrapper = mountDrawer({ selected: [brands[0]] })

    await chip(wrapper, 'Granix').trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')

    expect(wrapper.emitted('apply').at(-1)).toEqual([[]])
  })

  it('empties the draft with "Limpiar todo"', async () => {
    const wrapper = mountDrawer({ selected: [brands[0], brands[1]] })

    await wrapper.get('[data-testid="clear-draft"]').trigger('click')

    expect(chip(wrapper, 'Granix').attributes('aria-pressed')).toBe('false')
  })

  it('hides "Limpiar todo" when the draft is empty', () => {
    expect(mountDrawer().find('[data-testid="clear-draft"]').exists()).toBe(false)
  })

  it('asks for brands by name as the person types', async () => {
    const wrapper = mountDrawer()

    await wrapper.get('[aria-label="Buscar una marca"]').setValue('gra')

    expect(wrapper.emitted('search-brands').at(-1)).toEqual(['gra'])
  })

  it('says so when no brand matches what was typed', () => {
    const wrapper = mountDrawer({ brands: [] })

    expect(wrapper.text()).toContain('Ninguna marca coincide con eso.')
  })

  // Marcas is the only tab the backend can filter on; the other two are drawn
  // so that turning them on later needs no redesign.
  it('shows the three tabs but only lets Marcas be used', () => {
    const wrapper = mountDrawer()
    const tabs = wrapper.findAll('[data-testid="filter-tab"]')

    expect(tabs.map((tab) => tab.text())).toEqual(['Marcas', 'Categorías', 'Origen'])
    expect(tabs[0].attributes('aria-pressed')).toBe('true')
    expect(tabs[1].attributes('aria-disabled')).toBe('true')
    expect(tabs[1].attributes('disabled')).toBeDefined()
    expect(tabs[2].attributes('aria-disabled')).toBe('true')
  })

  it('closes from the header without applying anything', async () => {
    const wrapper = mountDrawer()

    await wrapper.get('[aria-label="Cerrar filtros"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('apply')).toBeUndefined()
  })

  it('closes when the backdrop is tapped', async () => {
    const wrapper = mountDrawer()

    await wrapper.get('[data-testid="filter-backdrop"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('closes when it is dragged far enough down', async () => {
    const wrapper = mountDrawer()
    const handle = wrapper.get('[data-testid="drawer-handle"]')

    await handle.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await handle.trigger('touchmove', { touches: [{ clientY: 400 }] })
    await handle.trigger('touchend')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
