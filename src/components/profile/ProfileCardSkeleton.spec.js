import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileCardSkeleton from './ProfileCardSkeleton.vue'
import SkeletonBlock from '../ui/SkeletonBlock.vue'

describe('ProfileCardSkeleton', () => {
  it('mirrors the profile form geometry with ten placeholder blocks', () => {
    const wrapper = mount(ProfileCardSkeleton)

    expect(wrapper.findAllComponents(SkeletonBlock)).toHaveLength(10)
  })

  it('hides every placeholder block from assistive technology', () => {
    const wrapper = mount(ProfileCardSkeleton)

    const blocks = wrapper.findAllComponents(SkeletonBlock)

    expect(blocks).toHaveLength(10)
    blocks.forEach((block) => expect(block.attributes('aria-hidden')).toBe('true'))
  })

  it('announces nothing because it carries no text', () => {
    const wrapper = mount(ProfileCardSkeleton)

    expect(wrapper.text()).toBe('')
  })

  it('exposes no interactive target while the profile is loading', () => {
    const wrapper = mount(ProfileCardSkeleton)

    expect(wrapper.findAll('button, input, a, select, textarea, [tabindex]')).toHaveLength(0)
  })
})
