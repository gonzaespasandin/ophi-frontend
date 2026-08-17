import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const findByNameAndBrand = vi.fn()
const back = vi.fn()

vi.mock('../services/product', () => ({
  findByNameAndBrand: (...args) => findByNameAndBrand(...args),
}))

vi.mock('../services/auth', () => ({
  suscribeToAuthObserver: (callback) => {
    callback({ profiles: profiles })
    return () => {}
  },
}))

vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { can_suggest: false } })),
    post: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { name: 'Galletitas de avena y chía', brand: 'Granix' } }),
  useRouter: () => ({ back }),
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
}))

import ProductView from './ProductView.vue'

const gluten = { id: 10, name: 'Gluten' }

let profiles = []

const product = {
  id: 1,
  name: 'Galletitas de avena y chía',
  brand: { name: 'Granix' },
  barcode: '7790040129012',
  ingredients: [
    { id: 100, name: 'Harina de trigo', parents: [gluten] },
    { id: 101, name: 'Sal', parents: [] },
  ],
}

const AuthLayoutStub = { template: '<div><slot /></div>' }

function respondWith(payload) {
  findByNameAndBrand.mockResolvedValue(payload)
}

async function mountView() {
  const wrapper = mount(ProductView, {
    global: {
      stubs: {
        AuthLayout: AuthLayoutStub,
        RecommendedCarousel: { template: '<div data-test="carousel" />' },
      },
    },
  })

  await flushPromises()

  return wrapper
}

beforeEach(() => {
  profiles = [{ id: 1, name: 'Nicolás', avatar_color: '#007050', ingredients: [gluten] }]
  respondWith({ 0: product, safeProducts: [] })
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('ProductView', () => {
  it('delivers the verdict for the household once the product lands', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('No apto para vos')
    expect(wrapper.text()).toContain('Harina de trigo')
    expect(wrapper.text()).toContain('Choca con "Gluten"')
  })

  it('never wears a colour while the answer is still travelling', async () => {
    findByNameAndBrand.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(ProductView, { global: { stubs: { AuthLayout: AuthLayoutStub } } })

    expect(wrapper.get('[data-testid="verdict-band"]').classes()).toContain('bg-ophi-slate')
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('offers a way out when the product is not on record', async () => {
    findByNameAndBrand.mockRejectedValue({ response: { status: 404 } })

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No tenemos este producto')
  })

  it('retries the fetch instead of dead-ending on a network error', async () => {
    findByNameAndBrand.mockRejectedValueOnce(new Error('offline'))

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos consultar el producto')

    respondWith({ 0: product, safeProducts: [] })
    await wrapper.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('No apto para vos')
  })

  it('breaks the verdict down by profile only when there is a household to break down', async () => {
    const single = await mountView()

    expect(single.text()).not.toContain('No apto para 1 perfil')

    profiles = [
      { id: 1, name: 'Nicolás', avatar_color: '#007050', ingredients: [gluten] },
      { id: 2, name: 'Martina', avatar_color: '#B91C1C', ingredients: [] },
    ]

    const household = await mountView()

    expect(household.text()).toContain('No apto para 1 perfil')
    expect(household.text()).toContain('Sin restricciones cargadas')
  })

  it('remembers the product among the latest searches', async () => {
    await mountView()

    expect(JSON.parse(localStorage.getItem('latestSearches'))).toEqual([
      { name: 'Galletitas de avena y chía', brand: 'Granix' },
    ])
  })

  it('walks back to where the user came from', async () => {
    const wrapper = await mountView()

    await wrapper.get('[aria-label="Volver"]').trigger('click')

    expect(back).toHaveBeenCalled()
  })
})
