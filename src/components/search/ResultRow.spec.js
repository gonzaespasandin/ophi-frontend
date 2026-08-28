import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultRow from './ResultRow.vue'

const gluten = { id: 10, name: 'Gluten' }
const nicolas = { id: 1, name: 'Nicolás', ingredients: [gluten] }

const product = {
  id: 1,
  name: 'Galletitas de avena y chía',
  brand: { name: 'Granix' },
  img: 'https://cdn.test/avena.jpg',
  img_alt: 'Paquete de galletitas de avena',
  ingredients: [{ id: 100, name: 'Harina de trigo', parents: [gluten] }],
}

const RouterLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

function mountRow(props) {
  return mount(ResultRow, {
    props: { profiles: [nicolas], ...props },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ResultRow', () => {
  it('names the product and its brand', () => {
    const wrapper = mountRow({ product })

    expect(wrapper.text()).toContain('Galletitas de avena y chía')
    expect(wrapper.text()).toContain('Granix')
  })

  it('opens the product detail by name and brand', () => {
    const wrapper = mountRow({ product })

    expect(wrapper.get('a').attributes('href'))
      .toBe('/product/Galletitas de avena y chía/Granix')
  })

  it('carries the verdict for the household so the decision is on the row', () => {
    expect(mountRow({ product }).text()).toContain('No apto para vos')
  })

  it('shows the product photo with the alt text the catalogue stored', () => {
    const image = mountRow({ product }).get('img')

    expect(image.attributes('src')).toBe('https://cdn.test/avena.jpg')
    expect(image.attributes('alt')).toBe('Paquete de galletitas de avena')
  })

  // Most of the catalogue has no photo yet, so the placeholder is the normal
  // case and must not read as a broken image.
  it('falls back to a placeholder when the catalogue has no photo', () => {
    const wrapper = mountRow({ product: { ...product, img: null } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-testid="row-photo-placeholder"]').exists()).toBe(true)
  })
})
