import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchField from './SearchField.vue'

function mountField(props = {}) {
  return mount(SearchField, { props: { modelValue: '', ...props } })
}

describe('SearchField', () => {
  it('reports what the person types', async () => {
    const wrapper = mountField()

    await wrapper.get('input').setValue('avena')

    expect(wrapper.emitted('update:modelValue')).toEqual([['avena']])
  })

  it('submits on Enter', async () => {
    const wrapper = mountField({ modelValue: 'avena' })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('offers no way to clear an empty field', () => {
    const wrapper = mountField()

    expect(wrapper.find('[aria-label="Borrar la búsqueda"]').exists()).toBe(false)
  })

  it('clears the field once there is something to clear', async () => {
    const wrapper = mountField({ modelValue: 'avena' })

    await wrapper.get('[aria-label="Borrar la búsqueda"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('names itself for screen readers', () => {
    const wrapper = mountField()

    expect(wrapper.get('input').attributes('aria-label')).toBe('Buscar productos')
  })

  it('takes the placeholder from the caller, so the scanner entry can ask for a name', () => {
    const wrapper = mountField({ placeholder: '¿Cómo se llama el producto?' })

    expect(wrapper.get('input').attributes('placeholder')).toBe('¿Cómo se llama el producto?')
  })
})
