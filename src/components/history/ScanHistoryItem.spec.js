import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanHistoryItem from './ScanHistoryItem.vue'

const scan = {
  id: 1,
  scanned_at: new Date(),
  product: { id: 9, name: 'Galletitas de avena y chía', brand: { id: 3, name: 'Granix' } },
  results: [
    {
      id: 1,
      is_safe: true,
      unsafe_ingredients: [],
      profile: { id: 1, name: 'Lucía', avatar_color: '#005B8E' },
    },
  ],
}

function mountItem(overrides = {}) {
  return mount(ScanHistoryItem, {
    props: { scan: { ...scan, ...overrides } },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('ScanHistoryItem', () => {
  it('shows the product name and when it was scanned', () => {
    const wrapper = mountItem()

    expect(wrapper.text()).toContain('Galletitas de avena y chía')
    expect(wrapper.text()).toContain('Hoy')
  })

  it('starts collapsed', () => {
    const wrapper = mountItem()

    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })

  it('expands the results when the row is pressed', async () => {
    const wrapper = mountItem()

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Apto para vos')
  })

  it('collapses again on a second press', async () => {
    const wrapper = mountItem()

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })

  it('wires the button to the panel it controls', () => {
    const wrapper = mountItem()
    const panelId = wrapper.get('button').attributes('aria-controls')

    expect(wrapper.get(`#${panelId}`).exists()).toBe(true)
  })

  it('names the toggle for screen readers, since it has no visible label', () => {
    const wrapper = mountItem()

    expect(wrapper.get('button').text()).toBe('Ver resultados de Galletitas de avena y chía')
  })

  describe('product link', () => {
    it('sends the product name to the product detail', () => {
      const wrapper = mountItem()

      expect(wrapper.get('a').attributes('href'))
        .toBe('/product/Galletitas de avena y chía/Granix')
    })

    it('hugs the text so the empty space beside the name still toggles', () => {
      const wrapper = mountItem()
      const link = wrapper.get('a')

      // A block link would stretch across the row and steal those taps.
      expect(link.classes()).toContain('inline-block')
      expect(link.classes()).not.toContain('block')
      expect(link.classes()).toContain('max-w-full')
    })

    it('keeps the link out of the toggle, so tapping the name does not expand', async () => {
      const wrapper = mountItem()

      await wrapper.get('a').trigger('click')

      expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    })

    it('leaves the name as plain text when the brand is missing', () => {
      const wrapper = mountItem({ product: { id: 9, name: 'Galletitas de avena y chía' } })

      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.text()).toContain('Galletitas de avena y chía')
    })

    it('still toggles when the name is not a link', async () => {
      const wrapper = mountItem({ product: { id: 9, name: 'Galletitas de avena y chía' } })

      await wrapper.get('button').trigger('click')

      expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    })
  })

  it('explains itself when the scan has no stored results', () => {
    const wrapper = mountItem({ results: [] })

    expect(wrapper.text()).toContain('No guardamos el resultado de este escaneo.')
  })

  it('survives a scan whose product was removed', () => {
    const wrapper = mountItem({ product: null })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('Producto sin nombre')
  })
})
