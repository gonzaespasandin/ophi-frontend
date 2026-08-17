import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendedProductCard from './RecommendedProductCard.vue'

const product = {
  id: 1,
  name: 'Arroz integral orgánico',
  brand: { id: 2, name: 'Gallo' },
  img: null,
  img_alt: null,
  safe_for_profile_ids: [1, 2, 3, 4],
}

const profiles = [
  { id: 1, name: 'Lucía', avatar_color: '#005B8E' },
  { id: 2, name: 'Joaquín', avatar_color: '#9A3412' },
  { id: 3, name: 'Sofía', avatar_color: '#6D28D9' },
  { id: 4, name: 'Pedro', avatar_color: '#374151' },
]

function mountCard(props) {
  return mount(RecommendedProductCard, {
    props: { product, ...props },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('RecommendedProductCard', () => {
  it('links to the product detail by name and brand', () => {
    const wrapper = mountCard({ profiles })

    expect(wrapper.get('a').attributes('href')).toBe('/product/Arroz integral orgánico/Gallo')
  })

  it('shows the brand under the product name', () => {
    const wrapper = mountCard({ profiles })

    expect(wrapper.text()).toContain('Arroz integral orgánico')
    expect(wrapper.text()).toContain('Gallo')
    expect(wrapper.text()).toContain('RECOMENDADO')
  })

  it('keeps the name on a single line so a long one never pushes the brand out', () => {
    const wrapper = mountCard({
      product: {
        ...product,
        name: 'Galletitas de avena y chía con semillas de lino y girasol',
        img: 'https://cdn.ophi.app/galletitas.jpg',
      },
      profiles,
    })

    const [name, brand] = wrapper.findAll('p')
    expect(name.classes()).toContain('truncate')
    expect(brand.text()).toBe('Gallo')
  })

  it('omits the brand line when the product has no brand', () => {
    const wrapper = mountCard({ product: { ...product, brand: null }, profiles })

    expect(wrapper.text()).toContain('Arroz integral orgánico')
    expect(wrapper.text()).not.toContain('Gallo')
  })

  describe('audience block', () => {
    it('stacks up to three avatars when the product suits the whole household', () => {
      const wrapper = mountCard({ profiles })

      expect(wrapper.text()).toContain('Apto para todos')
      expect(wrapper.findAll('[data-testid="profile-avatar"]')).toHaveLength(3)
    })

    it('names the person when the product is only safe for one profile', () => {
      const wrapper = mountCard({ product: { ...product, safe_for_profile_ids: [3] }, profiles })

      expect(wrapper.text()).toContain('Apto para Sofía')
      expect(wrapper.findAll('[data-testid="profile-avatar"]')).toHaveLength(1)
    })

    it('counts the profiles when the product suits some but not all of them', () => {
      const wrapper = mountCard({ product: { ...product, safe_for_profile_ids: [1, 3] }, profiles })

      expect(wrapper.text()).toContain('Apto para 2 perfiles')
      expect(wrapper.findAll('[data-testid="profile-avatar"]')).toHaveLength(2)
    })

    it('names the only person of a single-profile household', () => {
      const wrapper = mountCard({
        product: { ...product, safe_for_profile_ids: [1] },
        profiles: [profiles[0]],
      })

      expect(wrapper.text()).toContain('Apto para Lucía')
    })

    it('assumes the whole household when the payload carries no audience', () => {
      const wrapper = mountCard({
        product: { ...product, safe_for_profile_ids: undefined },
        profiles,
      })

      expect(wrapper.text()).toContain('Apto para todos')
    })

    it('still reads correctly before the profiles resolve', () => {
      const wrapper = mountCard({ profiles: [] })

      expect(wrapper.text()).toContain('Apto para todos')
      expect(wrapper.findAll('[data-testid="profile-avatar"]')).toHaveLength(0)
    })
  })

  describe('product photo', () => {
    it('renders the photo when the product has one', () => {
      const wrapper = mountCard({
        product: { ...product, img: 'https://cdn.ophi.app/arroz.jpg', img_alt: 'Paquete de arroz' },
        profiles,
      })

      const image = wrapper.get('img')
      expect(image.attributes('src')).toBe('https://cdn.ophi.app/arroz.jpg')
      expect(image.attributes('alt')).toBe('Paquete de arroz')
    })

    it('owns up to the missing photo instead of showing a mute placeholder', () => {
      const wrapper = mountCard({ profiles })

      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.text()).toContain('Ups, Ophi todavía no tiene la foto de este producto')
    })
  })

  it('dims and shrinks when it is not the centred card', () => {
    const dimmed = mountCard({ profiles, active: false })
    const centred = mountCard({ profiles, active: true })

    expect(dimmed.get('a').classes()).toContain('h-[212px]')
    expect(centred.get('a').classes()).toContain('h-[252px]')
  })
})
