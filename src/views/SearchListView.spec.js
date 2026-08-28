import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

const search = vi.fn()
const getBrandsByName = vi.fn()
const push = vi.fn()
const back = vi.fn()

vi.mock('../services/product', () => ({
  search: (...args) => search(...args),
  getBrandsByName: (...args) => getBrandsByName(...args),
}))

vi.mock('../services/auth', () => ({
  suscribeToAuthObserver: (callback) => {
    callback({ profiles })
    return () => {}
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params }),
  useRouter: () => ({
    push: (to) => {
      push(to)
      params.search = decodeURIComponent(String(to).replace('/search-list/', ''))
    },
    back,
  }),
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
}))

import SearchListView from './SearchListView.vue'

const gluten = { id: 10, name: 'Gluten' }

let profiles = []
let params = reactive({ search: 'avena' })

const BRANDS = [
  { id: 4, name: 'Granix' },
  { id: 7, name: 'Gallo Snack' },
]

function product(id, name, ingredients = []) {
  return { id, name, brand: { name: 'Granix' }, img: null, ingredients }
}

function page({ data, total = data.length, currentPage = 1, hasNext = false }) {
  return {
    data,
    total,
    per_page: 7,
    current_page: currentPage,
    last_page: hasNext ? currentPage + 1 : currentPage,
    next_page_url: hasNext ? 'http://api.test/search?page=2' : null,
    prev_page_url: null,
  }
}

const firstBatch = [
  product(1, 'Avena instantánea'),
  product(2, 'Galletitas de avena', [{ id: 100, name: 'Harina de trigo', parents: [gluten] }]),
]

const AuthLayoutStub = { template: '<div><slot /></div>' }

async function mountView() {
  const wrapper = mount(SearchListView, {
    global: { stubs: { AuthLayout: AuthLayoutStub } },
  })

  await flushPromises()

  return wrapper
}

beforeEach(() => {
  profiles = [{ id: 1, name: 'Nicolás', ingredients: [gluten] }]
  params = reactive({ search: 'avena' })
  sessionStorage.setItem('brands', JSON.stringify(BRANDS))
  search.mockReset()
  search.mockResolvedValue(page({ data: firstBatch, total: 2 }))
  getBrandsByName.mockReset()
  getBrandsByName.mockResolvedValue({ data: [] })
  push.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('SearchListView', () => {
  it('searches for the query in the route as soon as it opens', async () => {
    await mountView()

    expect(search).toHaveBeenCalledWith('avena', 1, '')
  })

  it('puts the real count and how much of it is on screen in the heading', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 9, hasNext: true }))

    const wrapper = await mountView()

    expect(wrapper.get('[data-testid="results-heading"]').text()).toBe('9 resultados')
    expect(wrapper.get('[data-testid="shown-label"]').text()).toBe('Mostrando 2')
  })

  it('gives every row its verdict for the household', async () => {
    const wrapper = await mountView()
    const rows = wrapper.findAll('[data-testid="verdict-chip"]')

    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('Sin ingredientes cargados')
    expect(rows[1].text()).toContain('No apto para vos')
  })

  // The numeric paginator was the only desktop-style control in a thumb-driven
  // PWA, and every other list in Ophi already loads in batches.
  it('has no numeric paginator left', async () => {
    const wrapper = await mountView()

    expect(wrapper.find('[data-testid="paginator"]').exists()).toBe(false)
  })

  it('appends the next batch under the first one', async () => {
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 3, hasNext: true }))
      .mockResolvedValueOnce(page({ data: [product(3, 'Barritas de avena')], total: 3, currentPage: 2 }))

    const wrapper = await mountView()

    expect(wrapper.get('[data-testid="load-more"]').text()).toContain('Ver 1 más')

    await wrapper.get('[data-testid="load-more"]').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="result-row"]')).toHaveLength(3)
    expect(wrapper.find('[data-testid="load-more"]').exists()).toBe(false)
  })

  it('closes the list naming what was searched when there is nothing more', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('[data-testid="end-of-list"]').text()).toContain('avena')
  })

  // Correcting one letter used to mean going back to the previous screen.
  it('re-searches from the field without leaving the screen', async () => {
    const wrapper = await mountView()

    await wrapper.get('input[aria-label="Editar la búsqueda"]').setValue('avena arrollada')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/search-list/avena%20arrollada')
    expect(search).toHaveBeenLastCalledWith('avena arrollada', 1, '')
  })

  it('opens the drawer, applies the brands and shows why the list changed', async () => {
    const wrapper = await mountView()

    await wrapper.get('[data-testid="filter-button"]').trigger('click')
    await wrapper.findAll('[data-testid="brand-chip"]')[0].trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')
    await flushPromises()

    expect(search).toHaveBeenLastCalledWith('avena', 1, '&brands=4')
    expect(wrapper.get('[data-testid="filter-chips"]').text()).toContain('Granix')
    expect(wrapper.get('[data-testid="filter-button"]').attributes('aria-label'))
      .toBe('Abrir filtros, 1 activos')
    expect(wrapper.find('[data-testid="filter-drawer"]').exists()).toBe(false)
  })

  it('lets an active chip take itself off the list', async () => {
    const wrapper = await mountView()

    await wrapper.get('[data-testid="filter-button"]').trigger('click')
    await wrapper.findAll('[data-testid="brand-chip"]')[0].trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')
    await flushPromises()

    await wrapper.get('[aria-label="Quitar el filtro Granix"]').trigger('click')
    await flushPromises()

    expect(search).toHaveBeenLastCalledWith('avena', 1, '')
    expect(wrapper.find('[data-testid="filter-chips"]').exists()).toBe(false)
  })

  it('asks the server for brands only when nothing local matches', async () => {
    getBrandsByName.mockResolvedValue({ data: [{ id: 12, name: 'Zucoa' }] })

    const wrapper = await mountView()
    await wrapper.get('[data-testid="filter-button"]').trigger('click')

    await wrapper.get('input[aria-label="Buscar una marca"]').setValue('gra')
    await flushPromises()

    expect(getBrandsByName).not.toHaveBeenCalled()
    expect(wrapper.findAll('[data-testid="brand-chip"]')).toHaveLength(1)

    await wrapper.get('input[aria-label="Buscar una marca"]').setValue('zuc')
    await flushPromises()

    expect(getBrandsByName).toHaveBeenCalledWith('zuc')
    expect(wrapper.get('[data-testid="brand-chip"]').text()).toContain('Zucoa')
  })

  it('names what was searched when the catalogue has nothing', async () => {
    params.search = 'mermelada light'
    search.mockResolvedValue(page({ data: [], total: 0 }))

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No lo tenemos cargado')
    expect(wrapper.text()).toContain('mermelada light')
    expect(wrapper.text()).not.toContain('¡Lo sentimos!')
  })

  // The stale list staying under the card is what confuses today.
  it('drops the old rows when the filters empty the list', async () => {
    const wrapper = await mountView()

    search.mockResolvedValue(page({ data: [], total: 0 }))

    await wrapper.get('[data-testid="filter-button"]').trigger('click')
    await wrapper.findAll('[data-testid="brand-chip"]')[0].trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Ningún resultado con esos filtros')
    expect(wrapper.findAll('[data-testid="result-row"]')).toHaveLength(0)
  })

  it('drops every filter from the empty card', async () => {
    const wrapper = await mountView()

    search.mockResolvedValue(page({ data: [], total: 0 }))
    await wrapper.get('[data-testid="filter-button"]').trigger('click')
    await wrapper.findAll('[data-testid="brand-chip"]')[0].trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')
    await flushPromises()

    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))
    await wrapper.get('[data-testid="clear-filters"]').trigger('click')
    await flushPromises()

    expect(search).toHaveBeenLastCalledWith('avena', 1, '')
    expect(wrapper.findAll('[data-testid="result-row"]')).toHaveLength(2)
  })

  it('reopens the drawer from the empty card', async () => {
    const wrapper = await mountView()

    search.mockResolvedValue(page({ data: [], total: 0 }))
    await wrapper.get('[data-testid="filter-button"]').trigger('click')
    await wrapper.findAll('[data-testid="brand-chip"]')[0].trigger('click')
    await wrapper.get('[data-testid="apply-filters"]').trigger('click')
    await flushPromises()

    await wrapper.get('[data-testid="adjust-filters"]').trigger('click')

    expect(wrapper.find('[data-testid="filter-drawer"]').exists()).toBe(true)
  })

  // The field survives the failure: what was typed is not lost with the screen.
  it('keeps the field alive and offers a retry when the search fails', async () => {
    search.mockRejectedValue(new Error('offline'))

    const wrapper = await mountView()

    expect(wrapper.find('input[aria-label="Editar la búsqueda"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No pudimos buscar')

    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))
    await wrapper.get('[data-testid="retry"]').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="result-row"]')).toHaveLength(2)
  })

  it('shows a row skeleton instead of a full-screen spinner, field included', async () => {
    let resolveSearch
    search.mockImplementationOnce(() => new Promise((resolve) => { resolveSearch = resolve }))

    const wrapper = mount(SearchListView, { global: { stubs: { AuthLayout: AuthLayoutStub } } })
    await flushPromises()

    expect(wrapper.find('[data-testid="result-skeleton"]').exists()).toBe(true)
    expect(wrapper.find('input[aria-label="Editar la búsqueda"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="filter-button"]').attributes('disabled')).toBeUndefined()

    resolveSearch(page({ data: firstBatch, total: 2 }))
    await flushPromises()

    expect(wrapper.find('[data-testid="result-skeleton"]').exists()).toBe(false)
  })

  it('goes back to the search screen from the band', async () => {
    const wrapper = await mountView()

    await wrapper.get('[aria-label="Volver al buscador"]').trigger('click')

    expect(back).toHaveBeenCalled()
  })

  it('survives a session with no brands cached', async () => {
    sessionStorage.removeItem('brands')

    const wrapper = await mountView()
    await wrapper.get('[data-testid="filter-button"]').trigger('click')

    expect(wrapper.text()).toContain('Ninguna marca coincide con eso.')
  })
})
