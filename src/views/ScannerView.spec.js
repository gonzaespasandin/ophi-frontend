import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ScannerView from './ScannerView.vue'

vi.mock('../services/auth', () => ({
  suscribeToAuthObserver: vi.fn((callback) => {
    callback({ profiles: [] })
    return () => {}
  }),
}))

vi.mock('../composables/useScanner.js', () => ({
  useScanner: () => ({
    scannerError: { value: '' },
    initializeScannerLibrary: vi.fn(),
    initializeScanner: vi.fn(() => Promise.resolve()),
    cleanupScanner: vi.fn(() => Promise.resolve()),
    resetLastScanned: vi.fn(),
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
}))

const AuthLayoutStub = {
  props: ['padded'],
  template: '<div data-test="layout" :data-padded="String(padded)"><slot /></div>',
}

async function mountScanner() {
  const wrapper = mount(ScannerView, {
    global: { stubs: { AuthLayout: AuthLayoutStub } },
  })

  await flushPromises()

  return wrapper
}

describe('ScannerView', () => {
  it('opts out of the layout bottom padding so the camera runs full bleed', async () => {
    const wrapper = await mountScanner()

    expect(wrapper.get('[data-test="layout"]').attributes('data-padded')).toBe('false')
  })

  it('stops hardcoding the removed navigation row height', async () => {
    const wrapper = await mountScanner()

    expect(wrapper.html()).not.toContain('88px')
  })

  it('clears the floating island under the results panel', async () => {
    const wrapper = await mountScanner()

    expect(wrapper.get('#results').classes()).toContain('pb-[var(--app-bottom-inset)]')
  })
})
