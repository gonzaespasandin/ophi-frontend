import { computed, ref } from 'vue'
import { search } from '../services/product'

/**
 * The result list of /search-list/:search: one query, one set of filters and a
 * batch of products that grows downwards.
 *
 * Batches accumulate instead of replacing each other, which is what lets the
 * screen drop the numeric paginator: every other list in Ophi already loads this
 * way, and `next_page_url` from the Laravel paginator is the only thing needed
 * to know whether another batch exists.
 */
export function useSearchResults() {
  const query = ref('')
  const products = ref([])
  const total = ref(0)
  const brandFilters = ref([])
  const state = ref('idle')
  const isLoadingMore = ref(false)
  const page = ref(1)
  const hasMore = ref(false)
  const batchSize = ref(0)

  const filterCount = computed(() => brandFilters.value.length)
  const hasFilters = computed(() => filterCount.value > 0)
  const remaining = computed(() => Math.max(total.value - products.value.length, 0))

  // One tap brings one backend page, so the button promises the size of that
  // page and not the whole remainder.
  const nextBatchCount = computed(() => Math.min(batchSize.value, remaining.value))
  const shownLabel = computed(() => `Mostrando ${products.value.length}`)

  // Only brands reach the backend: `ProductService::search` filters on
  // `brand_id` and nothing else, so categories and origin have no param to send.
  const filterQuery = computed(() =>
    hasFilters.value ? `&brands=${brandFilters.value.map((brand) => brand.id).join(',')}` : ''
  )

  async function start(newQuery) {
    query.value = newQuery ?? ''
    await runFirstPage()
  }

  async function applyBrands(brands) {
    brandFilters.value = brands ?? []
    await runFirstPage()
  }

  async function removeBrand(brandId) {
    await applyBrands(brandFilters.value.filter((brand) => brand.id !== brandId))
  }

  async function clearBrands() {
    await applyBrands([])
  }

  async function retry() {
    await runFirstPage()
  }

  async function runFirstPage() {
    state.value = 'loading'
    page.value = 1

    try {
      const result = await requestPage(1)

      // A fresh query owns the whole list: leaving the previous batch below an
      // empty card is the confusion this screen is fixing.
      products.value = result.data
      total.value = result.total ?? result.data.length
      hasMore.value = Boolean(result.next_page_url)
      batchSize.value = result.per_page ?? result.data.length

      if (result.data.length > 0) {
        state.value = 'ready'
        return
      }

      state.value = hasFilters.value ? 'filtered-empty' : 'empty'
    } catch (err) {
      console.error('[useSearchResults] -> No se pudo buscar productos', err)
      products.value = []
      total.value = 0
      hasMore.value = false
      state.value = 'error'
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value) return

    isLoadingMore.value = true

    try {
      const nextPage = page.value + 1
      const result = await requestPage(nextPage)

      page.value = nextPage
      products.value = products.value.concat(result.data)
      total.value = result.total ?? total.value
      hasMore.value = Boolean(result.next_page_url)
    } catch (err) {
      // The batch already on screen is still valid, so a failed "Ver más" leaves
      // the list alone rather than throwing the person back to an error screen.
      console.error('[useSearchResults] -> No se pudo cargar la siguiente tanda', err)
    } finally {
      isLoadingMore.value = false
    }
  }

  async function requestPage(requestedPage) {
    const result = await search(query.value, requestedPage, filterQuery.value)

    // services/product.js swallows the failure and returns the HTTP status, so
    // anything without a `data` array never made it to the paginator.
    if (!result || !Array.isArray(result.data)) {
      throw new Error('La búsqueda no devolvió un paginador')
    }

    return result
  }

  return {
    query,
    products,
    total,
    state,
    isLoadingMore,
    hasMore,
    remaining,
    shownLabel,
    nextBatchCount,
    brandFilters,
    filterCount,
    hasFilters,
    start,
    loadMore,
    applyBrands,
    removeBrand,
    clearBrands,
    retry,
  }
}
