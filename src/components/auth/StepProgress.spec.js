import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StepProgress from './StepProgress.vue'

describe('StepProgress', () => {
  it('renders one segment per step', () => {
    const wrapper = mount(StepProgress, { props: { current: 1, total: 6 } })

    expect(wrapper.findAll('[data-testid="step-segment"]')).toHaveLength(6)
  })

  it('fills the segments up to and including the current step', () => {
    const wrapper = mount(StepProgress, { props: { current: 4, total: 6 } })

    const filled = wrapper.findAll('[data-testid="step-segment"]')
      .filter(segment => segment.classes().includes('bg-ophi-action'))

    expect(filled).toHaveLength(4)
  })

  // The bar replaces a bare "4 / 6" that named nothing. Sighted users get the
  // step title next to it; screen readers get the same information here.
  it('announces the progress to assistive technology', () => {
    const wrapper = mount(StepProgress, { props: { current: 4, total: 6 } })
    const bar = wrapper.get('[role="progressbar"]')

    expect(bar.attributes('aria-valuenow')).toBe('4')
    expect(bar.attributes('aria-valuemin')).toBe('1')
    expect(bar.attributes('aria-valuemax')).toBe('6')
  })
})
