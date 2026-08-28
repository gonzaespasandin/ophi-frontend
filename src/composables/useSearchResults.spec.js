import { beforeEach, describe, expect, it, vi } from 'vitest'

const search = vi.fn()

vi.mock('../services/product', () => ({
  search: (...args) => search(...args),
}))

import { useSearchResults } from './useSearchResults.js'

function product(id, name) {
  return { id, name, brand: { name: 'Granix' }, ingredients: [] }
}

function page({ data, total = data.length, currentPage = 1, hasNext = false }) {
  return {
    data,
    total,
    current_page: currentPage,
    last_page: hasNext ? currentPage + 1 : currentPage,
    next_page_url: hasNext ? `http://api.test/search?page=${currentPage + 1}` : null,
    prev_page_url: currentPage > 1 ? 'http://api.test/search' : null,
  }
}

const firstBatch = [product(1, 'Avena instantánea'), product(2, 'Barritas de avena')]
const secondBatch = [product(3, 'Galletitas de avena')]

beforeEach(() => {
  search.mockReset()
})

describe('useSearchResults', () => {
  it('reports the total the backend counted, not the rows it shipped', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 9, hasNext: true }))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.state.value).toBe('ready')
    expect(results.total.value).toBe(9)
    expect(results.products.value).toHaveLength(2)
    expect(results.shownLabel.value).toBe('Mostrando 2')
  })

  // "Ver más" only makes sense if the batch lands under the previous one; a
  // paginator that swaps them is what this screen is replacing.
  it('appends the next batch instead of replacing the list', async () => {
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 3, hasNext: true }))
      .mockResolvedValueOnce(page({ data: secondBatch, total: 3, currentPage: 2 }))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.hasMore.value).toBe(true)
    expect(results.remaining.value).toBe(1)

    await results.loadMore()

    expect(results.products.value.map((p) => p.id)).toEqual([1, 2, 3])
    expect(search).toHaveBeenLastCalledWith('avena', 2, '')
    expect(results.hasMore.value).toBe(false)
  })

  // "Ver 7 más" has to promise what one tap actually brings, which is one
  // backend page, not everything that is left.
  it('promises one batch, never the whole remainder', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 50, hasNext: true }))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.remaining.value).toBe(48)
    expect(results.nextBatchCount.value).toBe(2)
  })

  it('promises only what is left when the last batch is a short one', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 3, hasNext: true }))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.nextBatchCount.value).toBe(1)
  })

  it('knows there is nothing left when the paginator has no next page', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.hasMore.value).toBe(false)
  })

  it('sends the selected brands and starts over from the first page', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')

    await results.applyBrands([{ id: 4, name: 'Granix' }, { id: 7, name: 'Gallo Snack' }])

    expect(search).toHaveBeenLastCalledWith('avena', 1, '&brands=4,7')
    expect(results.filterCount.value).toBe(2)
  })

  it('lets a single filter chip remove itself without touching the others', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')
    await results.applyBrands([{ id: 4, name: 'Granix' }, { id: 7, name: 'Gallo Snack' }])

    await results.removeBrand(4)

    expect(results.brandFilters.value.map((b) => b.id)).toEqual([7])
    expect(search).toHaveBeenLastCalledWith('avena', 1, '&brands=7')
  })

  it('drops every filter at once', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')
    await results.applyBrands([{ id: 4, name: 'Granix' }])

    await results.clearBrands()

    expect(results.brandFilters.value).toEqual([])
    expect(search).toHaveBeenLastCalledWith('avena', 1, '')
  })

  // The two empty screens are different problems with different exits: nothing
  // exists, versus it exists and the filters are hiding it.
  it('tells an empty database apart from filters that emptied the list', async () => {
    search.mockResolvedValue(page({ data: [], total: 0 }))

    const results = useSearchResults()
    await results.start('mermelada light')

    expect(results.state.value).toBe('empty')

    await results.applyBrands([{ id: 4, name: 'Granix' }])

    expect(results.state.value).toBe('filtered-empty')
  })

  // The stale list staying under the empty card is exactly what confuses today.
  it('clears the previous batch when a new search comes back empty', async () => {
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 2 }))
      .mockResolvedValueOnce(page({ data: [], total: 0 }))

    const results = useSearchResults()
    await results.start('avena')
    await results.start('zzz')

    expect(results.products.value).toEqual([])
  })

  it('goes to the recoverable error state when the request throws', async () => {
    search.mockRejectedValue(new Error('offline'))

    const results = useSearchResults()
    await results.start('avena')

    expect(results.state.value).toBe('error')
  })

  // The service swallows failures and hands back the HTTP status instead of a
  // paginator, so anything that is not a paginator is a failure.
  it('treats a bare status code from the service as a failure', async () => {
    search.mockResolvedValue(500)

    const results = useSearchResults()
    await results.start('avena')

    expect(results.state.value).toBe('error')
  })

  it('retries the same query and filters after an error', async () => {
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 2 }))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')
    await results.applyBrands([{ id: 4, name: 'Granix' }])

    expect(results.state.value).toBe('error')

    await results.retry()

    expect(search).toHaveBeenLastCalledWith('avena', 1, '&brands=4')
    expect(results.state.value).toBe('ready')
  })

  it('keeps the list on screen while the next batch travels', async () => {
    let resolveSecond
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 3, hasNext: true }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve }))

    const results = useSearchResults()
    await results.start('avena')

    const pending = results.loadMore()

    expect(results.isLoadingMore.value).toBe(true)
    expect(results.state.value).toBe('ready')

    resolveSecond(page({ data: secondBatch, total: 3, currentPage: 2 }))
    await pending

    expect(results.isLoadingMore.value).toBe(false)
  })

  it('keeps what it already showed when loading more fails', async () => {
    search
      .mockResolvedValueOnce(page({ data: firstBatch, total: 3, hasNext: true }))
      .mockRejectedValueOnce(new Error('offline'))

    const results = useSearchResults()
    await results.start('avena')
    await results.loadMore()

    expect(results.state.value).toBe('ready')
    expect(results.products.value).toHaveLength(2)
    expect(results.isLoadingMore.value).toBe(false)
  })

  it('refuses to load more when there is no next page', async () => {
    search.mockResolvedValue(page({ data: firstBatch, total: 2 }))

    const results = useSearchResults()
    await results.start('avena')
    await results.loadMore()

    expect(search).toHaveBeenCalledTimes(1)
  })
})
