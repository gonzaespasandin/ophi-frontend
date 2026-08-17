import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanResultSheet from './ScanResultSheet.vue'

function mountSheet(body, props = {}) {
  return mount(ScanResultSheet, {
    props,
    slots: {
      band: '<header>banda</header>',
      default: body,
    },
  })
}

async function scrollTo(wrapper, top) {
  const body = wrapper.get('[data-testid="sheet-body"]')

  Object.defineProperty(body.element, 'scrollTop', { value: top, configurable: true })
  await body.trigger('scroll')
}

function sheetOf(wrapper) {
  return wrapper.get('[role="dialog"]')
}

describe('ScanResultSheet', () => {
  it('reserves the floating island under the scrollable body', () => {
    const wrapper = mountSheet('<p>contenido</p>')

    expect(wrapper.get('[data-testid="sheet-body"]').classes())
      .toContain('pb-[var(--app-bottom-inset)]')
  })

  it('never scrolls sideways, whatever a card bleeds past the padding', () => {
    const wrapper = mountSheet('<div class="-mx-4">carrusel</div>')

    expect(wrapper.get('[data-testid="sheet-body"]').classes()).toContain('overflow-x-hidden')
  })

  it('rests at its collapsed height so the camera stays on screen', () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })

    expect(sheetOf(wrapper).attributes('style')).toContain('height: 78svh')
    expect(sheetOf(wrapper).attributes('data-full')).toBe('false')
  })

  it('takes the screen once the reader scrolls past the threshold', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })

    await scrollTo(wrapper, 60)

    expect(sheetOf(wrapper).attributes('data-full')).toBe('true')
    expect(sheetOf(wrapper).attributes('style')).toContain('height: 100%')
    expect(wrapper.emitted('update:full').at(-1)).toEqual([true])
  })

  it('holds still on the way there instead of flickering', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })

    await scrollTo(wrapper, 30)

    expect(sheetOf(wrapper).attributes('data-full')).toBe('false')
    expect(wrapper.emitted('update:full')).toBeUndefined()
  })

  it('gives the screen back when the list returns to the top', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })

    await scrollTo(wrapper, 400)
    await scrollTo(wrapper, 0)

    expect(sheetOf(wrapper).attributes('data-full')).toBe('false')
    expect(wrapper.emitted('update:full').at(-1)).toEqual([false])
  })

  it('survives the iOS scroll bounce, which never lands exactly on zero', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })

    await scrollTo(wrapper, 400)
    await scrollTo(wrapper, 2)

    expect(sheetOf(wrapper).attributes('data-full')).toBe('false')
  })

  it('stays collapsed on the states with nothing below the fold', async () => {
    const wrapper = mountSheet('<p>error de red</p>')

    await scrollTo(wrapper, 400)

    expect(sheetOf(wrapper).attributes('data-full')).toBe('false')
    expect(sheetOf(wrapper).attributes('style')).toContain('max-height: 78svh')
  })

  it('collapses by scrolling back, so one handler owns the state', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })
    const scrollTo = vi.fn()
    wrapper.get('[data-testid="sheet-body"]').element.scrollTo = scrollTo

    wrapper.vm.collapse()

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('announces an intentional exit when a link inside the panel is followed', async () => {
    const wrapper = mountSheet('<a href="/product/galletitas/granix">Ver la ficha completa</a>')

    await wrapper.get('a').trigger('click')

    expect(wrapper.emitted('leave')).toHaveLength(1)
    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('stays put when something that is not a link is tapped', async () => {
    const wrapper = mountSheet('<button type="button">Ver los 15 ingredientes</button>')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('leave')).toBeUndefined()
    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('dismisses when the band is dragged down from the top of the list', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })
    const grip = wrapper.get('[data-testid="sheet-grip"]')

    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 260 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('lets go of the drag once the panel took the screen, so it never fights the scroll', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })
    await scrollTo(wrapper, 400)

    const grip = wrapper.get('[data-testid="sheet-grip"]')
    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 400 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('springs back when the drag falls short of the threshold', async () => {
    const wrapper = mountSheet('<p>contenido</p>', { expandable: true })
    const grip = wrapper.get('[data-testid="sheet-grip"]')

    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 180 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })
})
