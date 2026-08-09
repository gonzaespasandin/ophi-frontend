import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RateLimitNotice from './RateLimitNotice.vue'

describe('RateLimitNotice', () => {
  it('announces the block assertively on insertion', () => {
    const wrapper = mount(RateLimitNotice)

    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('states the fixed limit that was reached', () => {
    const wrapper = mount(RateLimitNotice)

    expect(wrapper.text()).toContain('6 intentos por minuto')
  })

  it('asks the user to wait without promising a countdown', () => {
    const wrapper = mount(RateLimitNotice)

    expect(wrapper.text()).toContain('Esperá un momento')
    expect(wrapper.text()).not.toMatch(/\d+\s*segundos/)
  })
})
