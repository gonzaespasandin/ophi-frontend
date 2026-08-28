import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const getMatchesByName = vi.fn()
const search = vi.fn()
const push = vi.fn()

vi.mock('../services/product', () => ({
  getMatchesByName: (...args) => getMatchesByName(...args),
  search: (...args) => search(...args),
}))

vi.mock('../services/auth', () => ({
  suscribeToAuthObserver: (callback) => {
    callback({ name: 'Nicolás' })
    return () => {}
  },
}))

const route = { query: {} }

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
}))

import SearchView from './SearchView.vue'

const AuthLayoutStub = { template: '<div><slot /></div>' }

const galletitas = { id: 1, name: 'Galletitas de avena', brand: { name: 'Granix' } }

function storeHistory(searches) {
  localStorage.setItem('latestSearches', JSON.stringify(searches))
}

function mountView() {
  return mount(SearchView, {
    global: { stubs: { AuthLayout: AuthLayoutStub } },
  })
}

async function type(wrapper, value) {
  await wrapper.get('input').setValue(value)
  await vi.runAllTimersAsync()
  await flushPromises()
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  route.query = {}
  getMatchesByName.mockResolvedValue([galletitas])
  search.mockResolvedValue({ data: [galletitas] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('SearchView', () => {
  it('greets a first-time user with an explainer instead of an error', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('Buscá por nombre o marca')
    expect(wrapper.text()).not.toContain('No hay resultados')
  })

  it('shows the remembered searches, newest first', () => {
    storeHistory([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Yogur', brand: 'Ser' },
    ])

    const wrapper = mountView()
    const names = wrapper.findAll('li').map((row) => row.text())

    expect(wrapper.text()).toContain('Búsquedas recientes')
    expect(names[0]).toContain('Yogur')
    expect(names[1]).toContain('Leche')
  })

  it('lets a single recent search be removed for good', async () => {
    storeHistory([{ name: 'Leche', brand: 'La Serenísima' }, { name: 'Yogur', brand: 'Ser' }])

    const wrapper = mountView()
    await wrapper.get('[aria-label^="Quitar Yogur"]').trigger('click')

    expect(wrapper.text()).not.toContain('Yogur')
    expect(JSON.parse(localStorage.getItem('latestSearches'))).toEqual([
      { name: 'Leche', brand: 'La Serenísima' },
    ])
  })

  it('empties the whole history and says so', async () => {
    storeHistory([{ name: 'Leche', brand: 'La Serenísima' }])

    const wrapper = mountView()
    await wrapper.get('[data-test="clear-recent"]').trigger('click')

    expect(wrapper.text()).toContain('Listo, no quedó nada en el historial.')
    expect(JSON.parse(localStorage.getItem('latestSearches'))).toEqual([])
  })

  it('replaces the recent searches with suggestions while typing', async () => {
    storeHistory([{ name: 'Leche', brand: 'La Serenísima' }])

    const wrapper = mountView()
    await type(wrapper, 'avena')

    expect(getMatchesByName).toHaveBeenCalledWith('avena')
    expect(wrapper.text()).toContain('Galletitas de avena')
    expect(wrapper.text()).not.toContain('Búsquedas recientes')
  })

  it('makes the full search reachable as a row, not only as Enter', async () => {
    const wrapper = mountView()
    await type(wrapper, 'avena')

    await wrapper.get('[data-test="see-all"]').trigger('click')
    await flushPromises()

    expect(search).toHaveBeenCalledWith('avena')
    expect(JSON.parse(localStorage.getItem('products'))).toEqual([galletitas])
    expect(push).toHaveBeenCalledWith('/search-list/avena')
  })

  it('runs the same search from the keyboard', async () => {
    const wrapper = mountView()
    await type(wrapper, 'Avena')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(search).toHaveBeenCalledWith('avena')
  })

  it('tells an empty result apart from an untouched screen', async () => {
    getMatchesByName.mockResolvedValue([])

    const wrapper = mountView()
    await type(wrapper, 'zzz')

    expect(wrapper.text()).toContain('Sin coincidencias')
    expect(wrapper.text()).toContain('zzz')
    expect(wrapper.find('[data-test="see-all"]').exists()).toBe(false)
  })

  it('keeps the typed search and the field when the search fails', async () => {
    search.mockRejectedValue(new Error('offline'))

    const wrapper = mountView()
    await type(wrapper, 'avena')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('input').element.value).toBe('avena')
    expect(wrapper.text()).toContain('No pudimos buscar')
    expect(push).not.toHaveBeenCalled()
  })

  it('treats the service answering with a status code as a failure', async () => {
    search.mockResolvedValue(500)

    const wrapper = mountView()
    await type(wrapper, 'avena')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('No pudimos buscar')
    expect(push).not.toHaveBeenCalled()
  })

  it('retries the failed search from the error card', async () => {
    search.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [galletitas] })

    const wrapper = mountView()
    await type(wrapper, 'avena')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await wrapper.get('[data-test="retry"]').trigger('click')
    await flushPromises()

    expect(search).toHaveBeenCalledTimes(2)
    expect(push).toHaveBeenCalledWith('/search-list/avena')
  })

  it('drops the error as soon as the search is edited', async () => {
    search.mockRejectedValue(new Error('offline'))

    const wrapper = mountView()
    await type(wrapper, 'avena')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await type(wrapper, 'avena y chía')

    expect(wrapper.text()).not.toContain('No pudimos buscar')
  })

  it('searches straight away from a shortcut', async () => {
    const wrapper = mountView()

    await wrapper.findAll('[data-test="shortcut"]')[1].trigger('click')
    await flushPromises()

    expect(wrapper.get('input').element.value).toBe('Leche')
    expect(search).toHaveBeenCalledWith('leche')
  })

  it('offers no back arrow when the search is opened from the navigation', () => {
    const wrapper = mountView()

    expect(wrapper.find('[aria-label="Volver al escáner"]').exists()).toBe(false)
  })

  it('shows the scanned code and the way back to the scanner when coming from it', () => {
    route.query = { from: 'scanner', code: '7790000000000' }

    const wrapper = mountView()

    expect(wrapper.text()).toContain('Todavía no tenemos este código')
    expect(wrapper.text()).toContain('7790000000000')
    expect(wrapper.text()).toContain('Buscalo por nombre y nos ayudás')
    expect(wrapper.get('[aria-label="Volver al escáner"]').attributes('href')).toBe('/scanner')
  })

  it('does not let the scanned code be edited', () => {
    route.query = { from: 'scanner', code: '7790000000000' }

    const wrapper = mountView()

    expect(wrapper.findAll('input')).toHaveLength(1)
  })

  it('forgets the pending barcode so it is not offered on the next product', () => {
    localStorage.setItem('pending_scan_barcode', '7790000000000')

    mountView()

    expect(localStorage.getItem('pending_scan_barcode')).toBeNull()
  })

  it('ignores an empty search', async () => {
    const wrapper = mountView()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(search).not.toHaveBeenCalled()
  })
})
