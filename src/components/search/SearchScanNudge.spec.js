import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchScanNudge from './SearchScanNudge.vue'

describe('SearchScanNudge', () => {
  it('nudges towards the scanner when the product is at hand', () => {
    const wrapper = mount(SearchScanNudge)

    expect(wrapper.text()).toContain('Con el producto en la mano')
    expect(wrapper.text()).toContain('Escanear el código es más rápido.')
  })

  it('speaks louder for a first-time user', () => {
    const wrapper = mount(SearchScanNudge, { props: { tone: 'green' } })

    expect(wrapper.text()).toContain('Si lo tenés en la mano, escaneá')
    expect(wrapper.text()).toContain('Es más rápido y más preciso que el nombre.')
  })
})
