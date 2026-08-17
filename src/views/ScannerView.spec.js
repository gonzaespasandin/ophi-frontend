import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ScannerView from './ScannerView.vue'
import { processBarcode } from '../services/scanner.js'
import { saveToHistory } from '../services/history.js'

let detectedCallback = null
let authState = { profiles: [] }

vi.mock('../services/auth', () => ({
  suscribeToAuthObserver: vi.fn((callback) => {
    callback(authState)
    return () => {}
  }),
}))

vi.mock('../services/scanner.js', () => ({ processBarcode: vi.fn() }))
vi.mock('../services/history.js', () => ({ saveToHistory: vi.fn(() => Promise.resolve()) }))
vi.mock('../services/product', () => ({
  getMatchesByName: vi.fn(() => Promise.resolve([])),
  search: vi.fn(() => Promise.resolve([])),
  getSafeProducts: vi.fn(() => Promise.resolve([])),
}))

const pauseScanner = vi.fn()
const resumeScanner = vi.fn()

vi.mock('../composables/useScanner.js', () => ({
  useScanner: () => ({
    scannerError: { value: '' },
    initializeScannerLibrary: vi.fn(),
    initializeScanner: vi.fn((container, onDetected) => {
      detectedCallback = onDetected
      return Promise.resolve()
    }),
    cleanupScanner: vi.fn(() => Promise.resolve()),
    pauseScanner,
    resumeScanner,
    resetLastScanned: vi.fn(),
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
}))

const AuthLayoutStub = {
  props: ['padded'],
  template: '<div data-test="layout" :data-padded="String(padded)"><slot /></div>',
}

const PROFILES = [
  { id: 1, name: 'Martina', avatar_color: '#B91C1C', ingredients: [{ id: 10, name: 'Gluten' }] },
  { id: 2, name: 'Lucía', avatar_color: '#005B8E', ingredients: [{ id: 20, name: 'Lactosa' }] },
]

const PRODUCT = {
  id: 7,
  name: 'Galletitas de avena',
  brand: { name: 'Granix' },
  ingredients: [
    { id: 11, name: 'Harina de trigo', parents: [{ id: 10, name: 'Gluten' }] },
    { id: 30, name: 'Azúcar', parents: [] },
  ],
}

async function mountScanner() {
  const wrapper = mount(ScannerView, {
    global: { stubs: { AuthLayout: AuthLayoutStub } },
  })

  await flushPromises()

  return wrapper
}

async function scan(wrapper, code = '7790040129012') {
  await detectedCallback(code)
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  detectedCallback = null
  authState = { profiles: PROFILES }
})

describe('ScannerView', () => {
  it('opts out of the layout bottom padding so the camera runs full bleed', async () => {
    const wrapper = await mountScanner()

    expect(wrapper.get('[data-test="layout"]').attributes('data-padded')).toBe('false')
  })

  it('keeps the sheet closed until something is scanned', async () => {
    const wrapper = await mountScanner()

    expect(wrapper.find('#results').exists()).toBe(false)
  })

  it('clears the floating island under the scrollable sheet body', async () => {
    processBarcode.mockResolvedValue(PRODUCT)
    const wrapper = await scan(await mountScanner())

    expect(wrapper.get('[data-testid="sheet-body"]').classes())
      .toContain('pb-[var(--app-bottom-inset)]')
  })

  it('paints the band red when a profile collides with the product', async () => {
    processBarcode.mockResolvedValue(PRODUCT)
    const wrapper = await scan(await mountScanner())

    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('unsafe')
  })

  it('never promises a colour while the answer is still travelling', async () => {
    let resolveScan
    processBarcode.mockReturnValue(new Promise((resolve) => { resolveScan = resolve }))

    const wrapper = await mountScanner()
    detectedCallback('7790040129012')
    await flushPromises()

    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('loading')

    resolveScan(PRODUCT)
    await flushPromises()
  })

  it('stays neutral when no profile loaded restrictions', async () => {
    authState = { profiles: [{ id: 1, name: 'Martina', ingredients: [] }] }
    processBarcode.mockResolvedValue(PRODUCT)

    const wrapper = await scan(await mountScanner())

    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('unknown')
    expect(wrapper.find('[data-testid="no-restrictions"]').exists()).toBe(true)
  })

  it('turns a missing code into the search by name', async () => {
    processBarcode.mockRejectedValue({ response: { status: 404 } })
    const wrapper = await scan(await mountScanner())

    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('not-found')
    expect(wrapper.find('[data-testid="name-fallback-input"]').exists()).toBe(true)
    expect(localStorage.getItem('pending_scan_barcode')).toBe('7790040129012')
  })

  it('offers a login instead of a bare message when the session expired', async () => {
    processBarcode.mockRejectedValue({ response: { status: 401 } })
    const wrapper = await scan(await mountScanner())

    expect(wrapper.find('[data-testid="session-expired"]').exists()).toBe(true)
  })

  it('retries a network failure with the code already read', async () => {
    processBarcode.mockRejectedValueOnce({ response: { status: 500 } })
    const wrapper = await scan(await mountScanner())

    processBarcode.mockResolvedValueOnce(PRODUCT)
    await wrapper.get('[data-testid="error-retry"]').trigger('click')
    await flushPromises()

    expect(processBarcode).toHaveBeenLastCalledWith('7790040129012')
    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('unsafe')
  })

  it('still shows the verdict when the history write fails', async () => {
    processBarcode.mockResolvedValue(PRODUCT)
    saveToHistory.mockRejectedValueOnce(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await scan(await mountScanner())

    expect(wrapper.get('[data-testid="scan-band"]').attributes('data-variant')).toBe('unsafe')
  })

  it('stops the camera while the panel covers the screen, and starts it back', async () => {
    processBarcode.mockResolvedValue(PRODUCT)
    const wrapper = await scan(await mountScanner())
    const body = wrapper.get('[data-testid="sheet-body"]')

    Object.defineProperty(body.element, 'scrollTop', { value: 200, configurable: true })
    await body.trigger('scroll')

    expect(pauseScanner).toHaveBeenCalledTimes(1)

    Object.defineProperty(body.element, 'scrollTop', { value: 0, configurable: true })
    await body.trigger('scroll')

    expect(resumeScanner).toHaveBeenCalledTimes(1)
  })

  it('records every profile in the history, traces included', async () => {
    processBarcode.mockResolvedValue(PRODUCT)
    await scan(await mountScanner())

    expect(saveToHistory).toHaveBeenCalledWith(
      PRODUCT,
      [
        { forWho: 'Martina', isSafe: false, unsafeIngredients: ['Harina de trigo'] },
        { forWho: 'Lucía', isSafe: true, unsafeIngredients: [] },
      ],
      PROFILES,
    )
  })
})
