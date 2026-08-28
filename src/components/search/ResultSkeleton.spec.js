import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultSkeleton from './ResultSkeleton.vue'

describe('ResultSkeleton', () => {
  it('stands in for a batch of rows instead of a full-screen spinner', () => {
    const wrapper = mount(ResultSkeleton, { props: { rows: 3 } })

    expect(wrapper.findAll('[data-testid="skeleton-row"]')).toHaveLength(3)
  })

  // Without a placeholder for the verdict chip every row grows taller the moment
  // the data lands, and the whole list jumps under the thumb.
  it('reserves the verdict chip slot so rows do not change height on arrival', () => {
    const row = mount(ResultSkeleton).get('[data-testid="skeleton-row"]')

    expect(row.find('[data-testid="skeleton-verdict"]').exists()).toBe(true)
  })

  it('is invisible to assistive tech, it carries no information', () => {
    expect(mount(ResultSkeleton).get('[data-testid="result-skeleton"]').attributes('aria-hidden'))
      .toBe('true')
  })
})
