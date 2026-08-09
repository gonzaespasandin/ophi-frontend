import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthLayout from './AuthLayout.vue'

const BottomNavigationStub = { template: '<nav data-test="bottom-navigation" />' }

function mountLayout({ props = {}, attrs = {}, slot = '<p>contenido</p>' } = {}) {
  return mount(AuthLayout, {
    props,
    attrs,
    slots: { default: slot },
    global: { stubs: { BottomNavigation: BottomNavigationStub } },
  })
}

describe('AuthLayout', () => {
  it('renders a single root element', () => {
    const wrapper = mountLayout()

    expect(wrapper.element.id).toBe('container')
    expect(wrapper.findAll('#container')).toHaveLength(1)
  })

  it('lands a fallthrough class on the single root element', () => {
    const wrapper = mountLayout({ attrs: { class: 'square-with-gradient' } })

    expect(wrapper.get('#container').classes()).toContain('square-with-gradient')
  })

  it('keeps the scroll container padded by default', () => {
    const wrapper = mountLayout()

    expect(wrapper.get('#root-app').classes()).not.toContain('is-bleed')
  })

  it('bleeds the scroll container when padded is false', () => {
    const wrapper = mountLayout({ props: { padded: false } })

    expect(wrapper.get('#root-app').classes()).toContain('is-bleed')
  })

  it('renders the view content inside the scroll container', () => {
    const wrapper = mountLayout({ slot: '<p>contenido de la vista</p>' })

    expect(wrapper.get('#root-app').text()).toBe('contenido de la vista')
  })

  it('renders the bottom navigation as a sibling of the scroll container', () => {
    const wrapper = mountLayout()

    const children = Array.from(wrapper.element.children)

    expect(children.map((child) => child.tagName)).toEqual(['DIV', 'NAV'])
    expect(wrapper.find('[data-test="bottom-navigation"]').exists()).toBe(true)
  })
})
