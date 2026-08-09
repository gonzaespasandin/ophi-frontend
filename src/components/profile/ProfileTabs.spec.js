import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileTabs from './ProfileTabs.vue'

function mountTabs(modelValue = 'perfil') {
  return mount(ProfileTabs, {
    props: { modelValue },
    attachTo: document.body,
  })
}

describe('ProfileTabs', () => {
  it('exposes a labelled tablist with two tabs', () => {
    const wrapper = mountTabs()

    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('Contexto de perfil')
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
  })

  it('marks only the perfil tab as selected when perfil is active', () => {
    const wrapper = mountTabs('perfil')

    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs.map((tab) => tab.attributes('aria-selected'))).toEqual(['true', 'false'])
  })

  it('marks only the familiar tab as selected when familiar is active', () => {
    const wrapper = mountTabs('familiar')

    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs.map((tab) => tab.attributes('aria-selected'))).toEqual(['false', 'true'])
  })

  it('keeps a single tab in the tab order with a roving tabindex', () => {
    const wrapper = mountTabs('familiar')

    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs.map((tab) => tab.attributes('tabindex'))).toEqual(['-1', '0'])
  })

  it('wires each tab to its panel through stable ids', () => {
    const wrapper = mountTabs()

    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs.map((tab) => tab.attributes('id'))).toEqual([
      'profile-tab-perfil',
      'profile-tab-familiar',
    ])
    expect(tabs.map((tab) => tab.attributes('aria-controls'))).toEqual([
      'profile-panel-perfil',
      'profile-panel-familiar',
    ])
  })

  it('selects a tab when it is clicked', async () => {
    const wrapper = mountTabs('perfil')

    await wrapper.findAll('[role="tab"]')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['familiar']])
  })

  it('moves to the next tab with ArrowRight', async () => {
    const wrapper = mountTabs('perfil')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['familiar']])
  })

  it('wraps to the first tab when ArrowRight is pressed on the last tab', async () => {
    const wrapper = mountTabs('familiar')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['perfil']])
  })

  it('moves to the previous tab with ArrowLeft', async () => {
    const wrapper = mountTabs('familiar')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['perfil']])
  })

  it('wraps to the last tab when ArrowLeft is pressed on the first tab', async () => {
    const wrapper = mountTabs('perfil')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['familiar']])
  })

  it('jumps to the first tab with Home', async () => {
    const wrapper = mountTabs('familiar')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'Home' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['perfil']])
  })

  it('jumps to the last tab with End', async () => {
    const wrapper = mountTabs('perfil')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'End' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['familiar']])
  })

  it('ignores keys that are not part of the tablist contract', async () => {
    const wrapper = mountTabs('perfil')

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('moves DOM focus to the newly selected tab', async () => {
    const wrapper = mount(ProfileTabs, {
      props: {
        modelValue: 'perfil',
        'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }),
      },
      attachTo: document.body,
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement.id).toBe('profile-tab-familiar')
  })
})
