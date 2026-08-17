import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSafeProducts } from './useSafeProducts.js'
import { getSafeProducts } from '../services/product.js'

vi.mock('../services/product.js', () => ({ getSafeProducts: vi.fn() }))

describe('useSafeProducts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('starts in the loading state', () => {
    const { state } = useSafeProducts()

    expect(state.value).toBe('loading')
  })

  it('lands on ready with the products it fetched', async () => {
    getSafeProducts.mockResolvedValue([{ id: 1 }])
    const { state, products, load } = useSafeProducts()

    await load()

    expect(state.value).toBe('ready')
    expect(products.value).toHaveLength(1)
  })

  it('lands on empty when there is nothing to suggest', async () => {
    getSafeProducts.mockResolvedValue([])
    const { state, load } = useSafeProducts()

    await load()

    expect(state.value).toBe('empty')
  })

  it('degrades to empty instead of shouting when the request fails', async () => {
    getSafeProducts.mockRejectedValue(new Error('offline'))
    const { state, products, load } = useSafeProducts()

    await load()

    expect(state.value).toBe('empty')
    expect(products.value).toEqual([])
  })
})
