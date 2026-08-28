import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsBand from './ResultsBand.vue'

function mountBand(props = {}) {
  return mount(ResultsBand, { props: { modelValue: 'avena', ...props } })
}

describe('ResultsBand', () => {
  // Correcting one letter used to mean going back to the previous screen.
  it('carries the current query in an editable field', () => {
    expect(mountBand().get('input').element.value).toBe('avena')
  })

  it('asks for a new search when the field is submitted', async () => {
    const wrapper = mountBand()

    await wrapper.get('input').setValue('avena instantánea')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['avena instantánea'])
    expect(wrapper.emitted('submit').at(-1)).toEqual(['avena instantánea'])
  })

  it('refuses to search for nothing', async () => {
    const wrapper = mountBand({ modelValue: '   ' })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('empties the field without leaving the screen', async () => {
    const wrapper = mountBand()

    await wrapper.get('[aria-label="Borrar la búsqueda"]').trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([''])
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('offers nothing to clear when the field is already empty', () => {
    expect(mountBand({ modelValue: '' }).find('[aria-label="Borrar la búsqueda"]').exists()).toBe(false)
  })

  it('goes back to the search screen', async () => {
    const wrapper = mountBand()

    await wrapper.get('[aria-label="Volver al buscador"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  // Filtering by three brands used to change the list with nothing on screen
  // saying why, so the count travels on the button that caused it.
  it('shows how many filters are active on the filter button', () => {
    const wrapper = mountBand({ filterCount: 3 })
    const button = wrapper.get('[data-testid="filter-button"]')

    expect(button.attributes('aria-label')).toBe('Abrir filtros, 3 activos')
    expect(button.text()).toContain('3')
  })

  it('drops the badge when nothing is filtered', () => {
    const button = mountBand({ filterCount: 0 }).get('[data-testid="filter-button"]')

    expect(button.attributes('aria-label')).toBe('Abrir filtros')
    expect(button.text()).toBe('')
  })

  it('asks for the filter drawer', async () => {
    const wrapper = mountBand()

    await wrapper.get('[data-testid="filter-button"]').trigger('click')

    expect(wrapper.emitted('open-filters')).toHaveLength(1)
  })

  // The field and the filter button stay live while a batch travels: the person
  // can fix a typo without waiting for a request they no longer care about.
  it('stays usable while the results are loading', () => {
    const wrapper = mountBand({ loading: true })

    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[data-testid="filter-button"]').attributes('disabled')).toBeUndefined()
  })
})
