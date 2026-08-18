import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NewProfileData from './NewProfileData.vue'

const emptyForm = () => ({ ingredients: [], name: '', avatar: '' })

function mountStep(form = emptyForm(), props = {}) {
  return mount(NewProfileData, { props: { modelValue: form, ...props } })
}

const submit = wrapper => wrapper.get('[data-testid="save-profile"]')

describe('NewProfileData', () => {
  beforeEach(() => {
    sessionStorage.setItem('ophi-user', JSON.stringify({
      profiles: [{ id: 1, name: 'Lucía' }, { id: 2, name: 'Martina' }],
    }))
  })

  it('refuses to save a profile with no name', async () => {
    const wrapper = mountStep()

    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toBeUndefined()
    expect(wrapper.text()).toContain('El nombre es obligatorio')
  })

  // Two profiles with the same name are indistinguishable in the verdict screen,
  // where the name is the only thing telling them apart.
  it('refuses a name another profile already uses', async () => {
    const wrapper = mountStep({ ...emptyForm(), name: 'Martina' })

    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toBeUndefined()
    expect(wrapper.text()).toContain('Ya tenés un perfil con ese nombre')
  })

  it('saves a name that is free', async () => {
    const wrapper = mountStep({ ...emptyForm(), name: 'Joaquín' })

    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('clears a previous complaint once the name is corrected', async () => {
    const form = { ...emptyForm(), name: 'Martina' }
    const wrapper = mountStep(form)

    await submit(wrapper).trigger('click')
    await wrapper.get('#profile-name').setValue('Joaquín')
    await submit(wrapper).trigger('click')

    expect(wrapper.text()).not.toContain('Ya tenés un perfil con ese nombre')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  // A logged-out or freshly cleared session has no cached user; the step still
  // has to render rather than throw on a null payload.
  it('survives a session with no cached profiles', async () => {
    sessionStorage.removeItem('ophi-user')

    const wrapper = mountStep({ ...emptyForm(), name: 'Joaquín' })
    await submit(wrapper).trigger('click')

    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})
