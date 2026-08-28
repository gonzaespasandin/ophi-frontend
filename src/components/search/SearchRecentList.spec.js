import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchRecentList from './SearchRecentList.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

const searches = [
  { name: 'Yogur', brand: 'Ser' },
  { name: 'Leche', brand: 'La Serenísima' },
]

function mountList(props = {}) {
  return mount(SearchRecentList, {
    props: { searches, ...props },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('SearchRecentList', () => {
  it('lists every remembered search with its brand', () => {
    const wrapper = mountList()

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Yogur')
    expect(wrapper.text()).toContain('La Serenísima')
  })

  it('sends a recent search straight to its product sheet', () => {
    const wrapper = mountList()

    expect(wrapper.findAll('a')[0].attributes('href')).toBe('/product/Yogur/Ser')
  })

  it('lets a single entry be removed', async () => {
    const wrapper = mountList()

    await wrapper.findAll('[aria-label^="Quitar"]')[1].trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[searches[1]]])
  })

  it('lets the whole history be emptied', async () => {
    const wrapper = mountList()

    await wrapper.get('[data-test="clear-recent"]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('hides the empty button when there is nothing left to empty', () => {
    const wrapper = mountList({ searches: [], emptied: true })

    expect(wrapper.find('[data-test="clear-recent"]').exists()).toBe(false)
  })

  it('confirms the history is gone after the person emptied it', () => {
    const wrapper = mountList({ searches: [], emptied: true })

    expect(wrapper.text()).toContain('Listo, no quedó nada en el historial.')
  })
})
