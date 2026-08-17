import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductSummaryCard from './ProductSummaryCard.vue'

const product = { id: 1, name: 'Galletitas de avena y chía', brand: { name: 'Granix' }, weight: '170 g' }

describe('ProductSummaryCard', () => {
  it('names the product and its brand', () => {
    const wrapper = mount(ProductSummaryCard, { props: { product } })

    expect(wrapper.text()).toContain('Galletitas de avena y chía')
    expect(wrapper.text()).toContain('Granix · 170 g')
  })

  it('drops the separator when the weight is not on record', () => {
    const wrapper = mount(ProductSummaryCard, { props: { product: { ...product, weight: null } } })

    expect(wrapper.text()).toContain('Granix')
    expect(wrapper.text()).not.toContain('·')
  })

  it('shows the photo when there is one, and owns up when there is not', () => {
    const withPhoto = mount(ProductSummaryCard, {
      props: { product: { ...product, img: '/galletitas.jpg', img_alt: 'Paquete de galletitas' } },
    })

    expect(withPhoto.get('img').attributes('src')).toBe('/galletitas.jpg')
    expect(withPhoto.get('img').attributes('alt')).toBe('Paquete de galletitas')

    const withoutPhoto = mount(ProductSummaryCard, { props: { product } })

    expect(withoutPhoto.find('img').exists()).toBe(false)
    expect(withoutPhoto.text()).toContain('Ophi todavía no tiene la foto')
  })

  it('hosts the profile breakdown underneath', () => {
    const wrapper = mount(ProductSummaryCard, {
      props: { product },
      slots: { default: '<p>quién puede comerlo</p>' },
    })

    expect(wrapper.text()).toContain('quién puede comerlo')
  })
})
