import { beforeEach, describe, expect, it } from 'vitest'
import { useRecentSearches } from './useRecentSearches.js'

const STORAGE_KEY = 'latestSearches'

// ProductView writes the history oldest-first, so the fixtures mirror that order.
function storeSearches(searches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

function storedSearches() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
}

beforeEach(() => {
  localStorage.clear()
})

describe('useRecentSearches', () => {
  it('shows the newest search first', () => {
    storeSearches([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Yogur', brand: 'Ser' },
    ])

    const { searches } = useRecentSearches()

    expect(searches.value.map((search) => search.name)).toEqual(['Yogur', 'Leche'])
  })

  it('starts empty when nothing was ever searched', () => {
    const { searches } = useRecentSearches()

    expect(searches.value).toEqual([])
  })

  it('survives a corrupted history instead of breaking the screen', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')

    const { searches } = useRecentSearches()

    expect(searches.value).toEqual([])
  })

  it('removes a single entry and keeps the rest stored', () => {
    storeSearches([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Yogur', brand: 'Ser' },
    ])

    const { searches, remove } = useRecentSearches()
    remove({ name: 'Yogur', brand: 'Ser' })

    expect(searches.value.map((search) => search.name)).toEqual(['Leche'])
    expect(storedSearches()).toEqual([{ name: 'Leche', brand: 'La Serenísima' }])
  })

  it('keeps entries that only share the name with the removed one', () => {
    storeSearches([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Leche', brand: 'Sancor' },
    ])

    const { searches, remove } = useRecentSearches()
    remove({ name: 'Leche', brand: 'Sancor' })

    expect(searches.value).toEqual([{ name: 'Leche', brand: 'La Serenísima' }])
  })

  it('empties the whole history', () => {
    storeSearches([{ name: 'Leche', brand: 'La Serenísima' }])

    const { searches, clear } = useRecentSearches()
    clear()

    expect(searches.value).toEqual([])
    expect(storedSearches()).toEqual([])
  })

  it('reports that the history was emptied by hand, so the screen can say so', () => {
    storeSearches([{ name: 'Leche', brand: 'La Serenísima' }])

    const { wasEmptiedByHand, clear } = useRecentSearches()

    expect(wasEmptiedByHand.value).toBe(false)

    clear()

    expect(wasEmptiedByHand.value).toBe(true)
  })

  it('does not claim the history was emptied by hand when it never had anything', () => {
    const { wasEmptiedByHand, clear } = useRecentSearches()
    clear()

    expect(wasEmptiedByHand.value).toBe(false)
  })

  it('reports the history as emptied by hand when the last entry is removed one by one', () => {
    storeSearches([{ name: 'Leche', brand: 'La Serenísima' }])

    const { wasEmptiedByHand, remove } = useRecentSearches()
    remove({ name: 'Leche', brand: 'La Serenísima' })

    expect(wasEmptiedByHand.value).toBe(true)
  })

  it('writes the history back oldest-first so ProductView keeps appending', () => {
    storeSearches([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Yogur', brand: 'Ser' },
      { name: 'Fideos', brand: 'Matarazzo' },
    ])

    const { remove } = useRecentSearches()
    remove({ name: 'Yogur', brand: 'Ser' })

    expect(storedSearches()).toEqual([
      { name: 'Leche', brand: 'La Serenísima' },
      { name: 'Fideos', brand: 'Matarazzo' },
    ])
  })
})
