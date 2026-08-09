import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileToast from './ProfileToast.vue'

function mountToast(props = {}) {
  return mount(ProfileToast, { props: { message: 'Perfil guardado', ...props } })
}

describe('ProfileToast', () => {
  it('renders the message it was given', () => {
    const wrapper = mountToast({ message: 'Perfil guardado' })

    expect(wrapper.text()).toContain('Perfil guardado')
  })

  it('renders a different message unchanged', () => {
    const wrapper = mountToast({ message: 'No pudimos guardar los cambios' })

    expect(wrapper.text()).toContain('No pudimos guardar los cambios')
  })

  it('marks itself as a success toast by default', () => {
    const wrapper = mountToast()

    expect(wrapper.attributes('data-type')).toBe('success')
  })

  it('marks itself as an error toast when asked', () => {
    const wrapper = mountToast({ type: 'error' })

    expect(wrapper.attributes('data-type')).toBe('error')
  })

  it('owns no live region role so the static wrapper keeps that responsibility', () => {
    const wrapper = mountToast()

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-live')).toBeUndefined()
  })

  it('gives the dismiss control an accessible name', () => {
    const wrapper = mountToast()

    expect(wrapper.get('button').attributes('aria-label')).toBe('Cerrar aviso')
  })

  it('asks to be closed when the dismiss control is activated', async () => {
    const wrapper = mountToast()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('stays open while the user has not dismissed it', () => {
    const wrapper = mountToast()

    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
