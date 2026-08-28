import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchIntroCard from './SearchIntroCard.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountCard() {
  return mount(SearchIntroCard, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('SearchIntroCard', () => {
  it('explains how the search works instead of reading like an error', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Buscá por nombre o marca')
    expect(wrapper.text()).not.toContain('No hay resultados')
  })

  it('pushes the scanner, which is the main path', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Si lo tenés en la mano, escaneá')
  })

  it('offers shortcuts to get the first search going', () => {
    const wrapper = mountCard()
    const shortcuts = wrapper.findAll('[data-test="shortcut"]')

    expect(shortcuts.map((shortcut) => shortcut.text())).toEqual([
      'Galletitas',
      'Leche',
      'Yogur',
      'Barritas de cereal',
      'Fideos',
    ])
  })

  it('runs the search for the shortcut that was tapped', async () => {
    const wrapper = mountCard()

    await wrapper.findAll('[data-test="shortcut"]')[2].trigger('click')

    expect(wrapper.emitted('shortcut')).toEqual([['Yogur']])
  })
})
