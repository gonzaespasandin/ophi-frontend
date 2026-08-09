import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import BottomNavigation from './BottomNavigation.vue'

const observed = vi.hoisted(() => ({ user: {} }))

vi.mock('../services/auth.js', () => ({
  suscribeToAuthObserver: vi.fn((callback) => {
    callback(observed.user)
    return () => {}
  }),
}))

const Blank = { template: '<div />' }

const ROUTES = ['/', '/search', '/scanner', '/profile', '/history', '/admin/scanner'].map(
  (path) => ({ path, component: Blank })
)

async function mountNav({ user = {}, at = '/' } = {}) {
  observed.user = user

  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES })
  router.push(at)
  await router.isReady()

  return mount(BottomNavigation, { global: { plugins: [router] } })
}

function destinations(wrapper) {
  return wrapper.findAll('nav a')
}

describe('BottomNavigation', () => {
  it('exposes a named navigation landmark', async () => {
    const wrapper = await mountNav()

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Navegación principal')
  })

  it('renders the five destinations in visual order for a regular user', async () => {
    const wrapper = await mountNav()

    const links = destinations(wrapper)

    expect(links).toHaveLength(5)
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/',
      '/search',
      '/scanner',
      '/profile',
      '/history',
    ])
  })

  it('labels the text destinations with their visible names', async () => {
    const wrapper = await mountNav()

    const links = destinations(wrapper)

    expect(links.map((link) => link.text())).toEqual([
      'Inicio',
      'Buscar',
      '',
      'Perfil',
      'Historial',
    ])
  })

  it('swaps the last destination for Admin when the user is an admin', async () => {
    const wrapper = await mountNav({ user: { role: 'admin' } })

    const links = destinations(wrapper)

    expect(links).toHaveLength(5)
    expect(links[4].attributes('href')).toBe('/admin/scanner')
    expect(links[4].text()).toBe('Admin')
    expect(links.map((link) => link.attributes('href'))).not.toContain('/history')
  })

  it('gives the image-only scanner control an accessible name', async () => {
    const wrapper = await mountNav()

    const scanner = destinations(wrapper)[2]

    expect(scanner.attributes('href')).toBe('/scanner')
    expect(scanner.attributes('aria-label')).toBe('Escanear código de barras')
    expect(scanner.get('img').attributes('alt')).toBe('')
    expect(scanner.get('img').attributes('aria-hidden')).toBe('true')
  })

  it('hides every decorative icon from assistive technology', async () => {
    const wrapper = await mountNav()

    const icons = wrapper.findAll('nav i')

    expect(icons).toHaveLength(4)
    expect(icons.map((icon) => icon.attributes('aria-hidden'))).toEqual([
      'true',
      'true',
      'true',
      'true',
    ])
  })

  it('marks only the current route destination as the current page', async () => {
    const wrapper = await mountNav({ at: '/search' })

    const links = destinations(wrapper)

    expect(links.map((link) => link.attributes('aria-current'))).toEqual([
      undefined,
      'page',
      undefined,
      undefined,
      undefined,
    ])
  })

  it('moves the current page marker when the active route changes', async () => {
    const wrapper = await mountNav({ at: '/profile' })

    const links = destinations(wrapper)

    expect(links.map((link) => link.attributes('aria-current'))).toEqual([
      undefined,
      undefined,
      undefined,
      'page',
      undefined,
    ])
  })

  it('lets touches pass through the wrapper band but not through the island', async () => {
    const wrapper = await mountNav()

    expect(wrapper.get('nav').classes()).toContain('pointer-events-none')
    expect(wrapper.get('.nav-island').classes()).toContain('pointer-events-auto')
  })
})
