import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountCardSkeleton from './AccountCardSkeleton.vue'
import SkeletonBlock from '../ui/SkeletonBlock.vue'

describe('AccountCardSkeleton', () => {
  it('mirrors the account card geometry with ten placeholder blocks', () => {
    const wrapper = mount(AccountCardSkeleton)

    expect(wrapper.findAllComponents(SkeletonBlock)).toHaveLength(10)
  })

  it('hides every placeholder block from assistive technology', () => {
    const wrapper = mount(AccountCardSkeleton)

    const blocks = wrapper.findAllComponents(SkeletonBlock)

    expect(blocks).toHaveLength(10)
    blocks.forEach((block) => expect(block.attributes('aria-hidden')).toBe('true'))
  })

  it('announces nothing because it carries no text', () => {
    const wrapper = mount(AccountCardSkeleton)

    expect(wrapper.text()).toBe('')
  })

  it('exposes no interactive target while the account is loading', () => {
    const wrapper = mount(AccountCardSkeleton)

    expect(wrapper.findAll('button, input, a, select, textarea, [tabindex]')).toHaveLength(0)
  })
})
