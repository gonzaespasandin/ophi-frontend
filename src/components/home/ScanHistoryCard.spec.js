import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanHistoryCard from './ScanHistoryCard.vue'

const scans = [
  {
    id: 1,
    scanned_at: new Date(),
    product: { id: 9, name: 'Galletitas de avena y chía' },
    results: [{ id: 1, is_safe: true, unsafe_ingredients: [], profile: { id: 1, name: 'Lucía' } }],
  },
]

function mountCard(props) {
  return mount(ScanHistoryCard, {
    props,
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('ScanHistoryCard', () => {
  it('always names the section', () => {
    const wrapper = mountCard({ state: 'loading' })

    expect(wrapper.get('h2').text()).toBe('Tus últimos escaneos')
  })

  it('announces itself as busy while loading', () => {
    const wrapper = mountCard({ state: 'loading' })

    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('offers a retry when the history could not be fetched', async () => {
    const wrapper = mountCard({ state: 'error' })

    expect(wrapper.text()).toContain('No pudimos traer tu historial')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('says so when there is nothing scanned yet', () => {
    const wrapper = mountCard({ state: 'empty' })

    expect(wrapper.text()).toContain('Todavía no escaneaste ningún producto.')
  })

  it('lists the scans once they are ready', () => {
    const wrapper = mountCard({ state: 'ready', scans })

    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.text()).toContain('Galletitas de avena y chía')
  })

  it('only links to the full history when there is a history to link to', () => {
    expect(mountCard({ state: 'ready', scans }).text()).toContain('Ver más')
    expect(mountCard({ state: 'empty' }).text()).not.toContain('Ver más')
    expect(mountCard({ state: 'error' }).text()).not.toContain('Ver más')
  })
})
