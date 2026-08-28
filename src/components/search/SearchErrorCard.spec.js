import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchErrorCard from './SearchErrorCard.vue'

describe('SearchErrorCard', () => {
  it('says what failed and that nothing was lost', () => {
    const wrapper = mount(SearchErrorCard)

    expect(wrapper.text()).toContain('No pudimos buscar')
    expect(wrapper.text()).toContain('Tu búsqueda quedó escrita arriba.')
  })

  it('offers a retry', async () => {
    const wrapper = mount(SearchErrorCard)

    await wrapper.get('[data-test="retry"]').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
