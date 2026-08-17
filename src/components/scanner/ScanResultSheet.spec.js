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

  // The camera is the point of this screen. The panel answers the question and
  // gets out of the way; the whole story lives one tap away, on the product page.
  it('never takes more than its share of the screen', () => {
    const wrapper = mountSheet('<p>contenido</p>')

    expect(sheetOf(wrapper).attributes('style')).toContain('max-height: 78svh')
  })

  it('keeps its height whatever the reader scrolls inside it', async () => {
    const wrapper = mountSheet('<p>contenido</p>')
    const before = sheetOf(wrapper).attributes('style')

    await scrollTo(wrapper, 400)

    expect(sheetOf(wrapper).attributes('style')).toBe(before)
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
    const wrapper = mountSheet('<p>contenido</p>')
    const grip = wrapper.get('[data-testid="sheet-grip"]')

    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 260 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('lets go of the drag once the list scrolled, so it never fights the scroll', async () => {
    const wrapper = mountSheet('<p>contenido</p>')
    await scrollTo(wrapper, 400)

    const grip = wrapper.get('[data-testid="sheet-grip"]')
    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 400 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('springs back when the drag falls short of the threshold', async () => {
    const wrapper = mountSheet('<p>contenido</p>')
    const grip = wrapper.get('[data-testid="sheet-grip"]')

    await grip.trigger('touchstart', { touches: [{ clientY: 100 }] })
    await grip.trigger('touchmove', { touches: [{ clientY: 180 }] })
    await grip.trigger('touchend')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })
})
