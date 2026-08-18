import { describe, expect, it, vi } from 'vitest'
import { useIngredientOptions } from './useIngredientOptions.js'

describe('useIngredientOptions', () => {
  it('starts loading before anything is fetched', () => {
    const { options, state } = useIngredientOptions(vi.fn())

    expect(state.value).toBe('loading')
    expect(options.value).toEqual([])
  })

  it('exposes the fetched options once they arrive', async () => {
    const fetchOptions = vi.fn().mockResolvedValue([{ id: 1, name: 'Lactosa' }])
    const { options, state, load } = useIngredientOptions(fetchOptions)

    await load()

    expect(state.value).toBe('ready')
    expect(options.value).toEqual([{ id: 1, name: 'Lactosa' }])
  })

  it('treats a missing payload as an empty list rather than a failure', async () => {
    const { options, state, load } = useIngredientOptions(vi.fn().mockResolvedValue(undefined))

    await load()

    expect(state.value).toBe('ready')
    expect(options.value).toEqual([])
  })

  // Without the list nobody can state a restriction, so a failed fetch is a
  // dead end the person has to be able to retry — not a silently empty step.
  it('reports an error state when the fetch fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { options, state, load } = useIngredientOptions(vi.fn().mockRejectedValue(new Error('offline')))

    await load()

    expect(state.value).toBe('error')
    expect(options.value).toEqual([])
  })

  it('goes back to loading when a failed load is retried', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchOptions = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ id: 2, name: 'Gluten' }])
    const { options, state, load } = useIngredientOptions(fetchOptions)

    await load()
    expect(state.value).toBe('error')

    await load()

    expect(state.value).toBe('ready')
    expect(options.value).toEqual([{ id: 2, name: 'Gluten' }])
  })
})
