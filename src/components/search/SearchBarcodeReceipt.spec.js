import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBarcodeReceipt from './SearchBarcodeReceipt.vue'

describe('SearchBarcodeReceipt', () => {
  it('reads as a receipt of what was just scanned, not as a warning', () => {
    const wrapper = mount(SearchBarcodeReceipt, { props: { code: '7790000000000' } })

    expect(wrapper.text()).toContain('Todavía no tenemos este código')
    expect(wrapper.text()).toContain('7790000000000')
  })

  it('shows the code as data, never as an editable field', () => {
    const wrapper = mount(SearchBarcodeReceipt, { props: { code: '7790000000000' } })

    expect(wrapper.find('input').exists()).toBe(false)
  })
})
