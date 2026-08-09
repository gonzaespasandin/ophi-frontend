import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonBlock from './SkeletonBlock.vue'

describe('SkeletonBlock', () => {
  it('hides itself from assistive technology', () => {
    const wrapper = mount(SkeletonBlock)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('renders no text content so nothing is announced or read', () => {
    const wrapper = mount(SkeletonBlock)

    expect(wrapper.text()).toBe('')
  })

  it('keeps its own shimmer class when the caller passes sizing classes', () => {
    const wrapper = mount(SkeletonBlock, { attrs: { class: 'w-[130px] h-[13px]' } })

    const classes = wrapper.classes()

    expect(classes).toContain('shimmer')
    expect(classes).toContain('w-[130px]')
    expect(classes).toContain('h-[13px]')
  })

  it('keeps its own shimmer class for a different caller geometry', () => {
    const wrapper = mount(SkeletonBlock, { attrs: { class: 'h-11 rounded-card' } })

    const classes = wrapper.classes()

    expect(classes).toContain('shimmer')
    expect(classes).toContain('h-11')
    expect(classes).toContain('rounded-card')
  })
})
