import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoCard from './InfoCard.vue'

describe('InfoCard', () => {
  it('renders the title inside a level 2 heading', () => {
    const wrapper = mount(InfoCard, {
      props: { icon: 'fa-solid fa-id-card', title: 'Datos del perfil' },
    })

    expect(wrapper.get('h2').text()).toBe('Datos del perfil')
  })

  it('renders a different title without touching the heading level', () => {
    const wrapper = mount(InfoCard, {
      props: { icon: 'fa-solid fa-gear', title: 'Cuenta' },
    })

    expect(wrapper.get('h2').text()).toBe('Cuenta')
  })

  it('hides the decorative icon from assistive technology', () => {
    const wrapper = mount(InfoCard, {
      props: { icon: 'fa-solid fa-gear', title: 'Cuenta' },
    })

    expect(wrapper.get('i').attributes('aria-hidden')).toBe('true')
  })

  it('renders the icon requested through the prop', () => {
    const wrapper = mount(InfoCard, {
      props: { icon: 'fa-solid fa-wheat-awn-circle-exclamation', title: 'Restricción alimenticia' },
    })

    expect(wrapper.get('i').classes()).toContain('fa-wheat-awn-circle-exclamation')
  })

  it('renders the default slot as the card body', () => {
    const wrapper = mount(InfoCard, {
      props: { icon: 'fa-solid fa-gear', title: 'Cuenta' },
      slots: { default: '<p>Contenido de la tarjeta</p>' },
    })

    expect(wrapper.text()).toContain('Contenido de la tarjeta')
  })
})
