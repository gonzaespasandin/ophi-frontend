import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductVerdictBand from './ProductVerdictBand.vue'

function mountBand(props) {
  return mount(ProductVerdictBand, {
    props,
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('ProductVerdictBand', () => {
  it('says who cannot eat it when a household profile is hit', () => {
    const wrapper = mountBand({ verdict: 'unsafe', profilesCount: 8, unsafeCount: 2 })

    expect(wrapper.get('h1').text()).toBe('No apto para 2')
    expect(wrapper.text()).toContain('de tus 8 perfiles')
  })

  it('speaks in the first person when there is a single profile', () => {
    expect(mountBand({ verdict: 'unsafe', profilesCount: 1, unsafeCount: 1, conflictCount: 2 }).text())
      .toContain('No apto para vos')
    expect(mountBand({ verdict: 'safe', profilesCount: 1, unsafeCount: 0 }).text())
      .toContain('Apto para vos')
  })

  it('clears the whole household when nobody is hit', () => {
    const wrapper = mountBand({ verdict: 'safe', profilesCount: 4, unsafeCount: 0 })

    expect(wrapper.get('h1').text()).toBe('Apto para todos')
  })

  it('refuses to fake a verdict it cannot sustain', () => {
    const wrapper = mountBand({ verdict: 'unknown', profilesCount: 1, unsafeCount: 0 })

    expect(wrapper.get('h1').text()).toContain('Todavía no podemos darte un veredicto')
    expect(wrapper.text()).toContain('Producto escaneado')
  })

  // The colour has to read before a single word does, and it never lies while
  // the answer is still travelling.
  it('paints itself from the verdict, and stays neutral until there is one', () => {
    expect(mountBand({ verdict: 'unsafe' }).get('[data-testid="verdict-band"]').classes())
      .toContain('bg-ophi-danger')
    expect(mountBand({ verdict: 'safe' }).get('[data-testid="verdict-band"]').classes())
      .toContain('bg-ophi-green-dark')
    expect(mountBand({ verdict: 'unknown' }).get('[data-testid="verdict-band"]').classes())
      .toContain('bg-ophi-slate')
    expect(mountBand({ verdict: 'loading' }).get('[data-testid="verdict-band"]').classes())
      .toContain('bg-ophi-slate')
  })

  it('keeps a way back and a way to scan the next one', async () => {
    const wrapper = mountBand({ verdict: 'safe', profilesCount: 1 })

    await wrapper.get('[aria-label="Volver"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
    expect(wrapper.get('a[href="/scanner"]').attributes('aria-label')).toBe('Escanear otro producto')
  })

  it('holds the shape of the verdict while it loads, without announcing one', () => {
    const wrapper = mountBand({ verdict: 'loading' })

    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })
})
