import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordRules from './PasswordRules.vue'

const rules = wrapper => wrapper.findAll('[data-testid="password-rule"]')
const ruleFor = (wrapper, label) => rules(wrapper).find(rule => rule.text().includes(label))

describe('PasswordRules', () => {
  it('lists the three rules regardless of what is typed', () => {
    const wrapper = mount(PasswordRules, { props: { password: '' } })

    expect(rules(wrapper)).toHaveLength(3)
  })

  // The checklist replaces a grey line of fine print. Its whole point is that
  // it answers "am I there yet?" while typing, not after submitting.
  it('ticks a rule as soon as the password meets it', () => {
    const wrapper = mount(PasswordRules, { props: { password: 'secretasegura' } })

    expect(ruleFor(wrapper, 'Al menos 8 caracteres').classes()).toContain('text-white')
    expect(ruleFor(wrapper, 'Una letra mayúscula').classes()).toContain('text-white/70')
  })

  it('re-evaluates the rules when the password changes', async () => {
    const wrapper = mount(PasswordRules, { props: { password: 'secreta' } })

    expect(ruleFor(wrapper, 'Al menos 8 caracteres').classes()).toContain('text-white/70')

    await wrapper.setProps({ password: 'secretaSegura' })

    expect(ruleFor(wrapper, 'Al menos 8 caracteres').classes()).toContain('text-white')
  })

  // Colour alone cannot carry the met/unmet distinction (WCAG 1.4.1), so each
  // row also swaps its icon, and the state is announced rather than implied.
  it('distinguishes a met rule by more than colour', () => {
    const wrapper = mount(PasswordRules, { props: { password: 'secretasegura' } })

    expect(ruleFor(wrapper, 'Al menos 8 caracteres').get('i').classes()).toContain('fa-check')
    expect(ruleFor(wrapper, 'Una letra mayúscula').get('i').classes()).toContain('fa-minus')
  })

  it('announces to assistive tech which rules are already met', () => {
    const wrapper = mount(PasswordRules, { props: { password: 'secretasegura' } })

    expect(ruleFor(wrapper, 'Al menos 8 caracteres').text()).toContain('cumplido')
    expect(ruleFor(wrapper, 'Una letra mayúscula').text()).not.toContain('cumplido')
  })

  // The field points at this list with aria-describedby, so the list has to
  // carry the id it was given.
  it('takes the id the describing field points at', () => {
    const wrapper = mount(PasswordRules, { props: { password: '', id: 'rp-rules' } })

    expect(wrapper.attributes('id')).toBe('rp-rules')
  })
})
