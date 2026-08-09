import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteProfileDialogContent from './DeleteProfileDialogContent.vue'

function mountContent(props = {}) {
  return mount(DeleteProfileDialogContent, {
    props: { name: 'Martina', ...props },
  })
}

describe('DeleteProfileDialogContent', () => {
  it('names the profile being deleted in the heading', () => {
    const wrapper = mountContent()

    expect(wrapper.get('h3').text()).toBe('¿Eliminar a Martina?')
  })

  it('follows the profile it was given rather than a hardcoded name', () => {
    const wrapper = mountContent({ name: 'Joaquín' })

    expect(wrapper.get('h3').text()).toBe('¿Eliminar a Joaquín?')
  })

  it('explains what deletion removes', () => {
    const wrapper = mountContent()

    expect(wrapper.text()).toContain('Se borra el perfil y sus restricciones')
  })

  it('warns that the deletion cannot be undone', () => {
    const wrapper = mountContent()

    expect(wrapper.text()).toContain('No se puede deshacer')
  })

  it('emits cancel without emitting confirm when the user backs out', async () => {
    const wrapper = mountContent()

    await wrapper.get('[data-testid="cancel-delete-profile"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('emits confirm without emitting cancel when the user confirms', async () => {
    const wrapper = mountContent()

    await wrapper.get('[data-testid="confirm-delete-profile"]').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('renders the profile initial tinted with the given avatar colour', () => {
    const wrapper = mountContent({ avatarColor: '#9A3412' })

    const avatar = wrapper.get('[data-testid="delete-dialog-avatar"]')

    expect(avatar.text()).toBe('M')
    expect(avatar.attributes('style')).toContain('background-color: rgb(154, 52, 18)')
  })

  it('falls back to the institutional blue when no avatar colour is given', () => {
    const wrapper = mountContent()

    expect(wrapper.get('[data-testid="delete-dialog-avatar"]').attributes('style')).toContain(
      'background-color: rgb(0, 91, 142)'
    )
  })
})
