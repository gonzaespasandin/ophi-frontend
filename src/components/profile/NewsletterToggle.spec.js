import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsletterToggle from './NewsletterToggle.vue'

describe('NewsletterToggle', () => {
  it('exposes a native switch reflecting the subscribed state', () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: true } })

    const input = wrapper.get('input[type="checkbox"]')

    expect(input.attributes('role')).toBe('switch')
    expect(input.element.checked).toBe(true)
  })

  it('reflects an unsubscribed account', () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: false } })

    expect(wrapper.get('input[type="checkbox"]').element.checked).toBe(false)
  })

  it('emits the new preference when the user subscribes', async () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: false } })

    await wrapper.get('input[type="checkbox"]').setValue(true)

    expect(wrapper.emitted('change')).toEqual([[true]])
  })

  it('emits the new preference when the user unsubscribes', async () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: true } })

    await wrapper.get('input[type="checkbox"]').setValue(false)

    expect(wrapper.emitted('change')).toEqual([[false]])
  })

  it('blocks the switch while the preference is being saved', () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: false, loading: true } })

    expect(wrapper.get('input[type="checkbox"]').attributes('disabled')).toBeDefined()
  })

  it('gives the switch an accessible name', () => {
    const wrapper = mount(NewsletterToggle, { props: { subscribed: false } })

    expect(wrapper.text()).toContain('Novedades')
  })
})
