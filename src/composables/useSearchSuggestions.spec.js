import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

const getMatchesByName = vi.fn()

vi.mock('../services/product', () => ({
  getMatchesByName: (...args) => getMatchesByName(...args),
}))

import { useSearchSuggestions } from './useSearchSuggestions.js'

const galletitas = { id: 1, name: 'Galletitas de avena', brand: { name: 'Granix' } }

beforeEach(() => {
  vi.useFakeTimers()
  getMatchesByName.mockResolvedValue([galletitas])
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

async function settle() {
  await vi.runAllTimersAsync()
  await flushPromises()
}

describe('useSearchSuggestions', () => {
  it('waits for the typing to settle before hitting the API', async () => {
    const { search } = useSearchSuggestions()

    search('a')
    search('av')
    search('ave')

    expect(getMatchesByName).not.toHaveBeenCalled()

    await settle()

    expect(getMatchesByName).toHaveBeenCalledTimes(1)
    expect(getMatchesByName).toHaveBeenCalledWith('ave')
  })

  it('exposes the matches once they arrive', async () => {
    const { search, suggestions, status } = useSearchSuggestions()

    search('avena')
    await settle()

    expect(suggestions.value).toEqual([galletitas])
    expect(status.value).toBe('ready')
  })

  it('reports an empty result apart from a full one', async () => {
    getMatchesByName.mockResolvedValue([])

    const { search, suggestions, status } = useSearchSuggestions()

    search('zzz')
    await settle()

    expect(suggestions.value).toEqual([])
    expect(status.value).toBe('empty')
  })

  it('treats a failed lookup as no matches instead of crashing', async () => {
    getMatchesByName.mockRejectedValue(new Error('offline'))

    const { search, suggestions, status } = useSearchSuggestions()

    search('avena')
    await settle()

    expect(suggestions.value).toEqual([])
    expect(status.value).toBe('empty')
  })

  it('ignores a payload that is not a list, which is what the service returns on error', async () => {
    getMatchesByName.mockResolvedValue(500)

    const { search, suggestions, status } = useSearchSuggestions()

    search('avena')
    await settle()

    expect(suggestions.value).toEqual([])
    expect(status.value).toBe('empty')
  })

  it('goes back to idle and drops the matches when the field is emptied', async () => {
    const { search, suggestions, status } = useSearchSuggestions()

    search('avena')
    await settle()

    search('')

    expect(suggestions.value).toEqual([])
    expect(status.value).toBe('idle')
    expect(getMatchesByName).toHaveBeenCalledTimes(1)
  })

  it('does not let a slow answer overwrite a newer one', async () => {
    let resolveFirst
    getMatchesByName
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce([galletitas])

    const { search, suggestions } = useSearchSuggestions()

    search('av')
    await vi.advanceTimersByTimeAsync(300)

    search('avena')
    await settle()

    resolveFirst([{ id: 99, name: 'Stale', brand: { name: 'Vieja' } }])
    await flushPromises()

    expect(suggestions.value).toEqual([galletitas])
  })

  it('cancels a pending lookup when the screen goes away', async () => {
    const { search, cancel } = useSearchSuggestions()

    search('avena')
    cancel()
    await settle()

    expect(getMatchesByName).not.toHaveBeenCalled()
  })
})
