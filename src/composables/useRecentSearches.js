import { computed, ref } from 'vue'

const STORAGE_KEY = 'latestSearches'

/**
 * The recent searches shown on the search screen, newest first and editable.
 *
 * ProductView owns the writing side (`rememberSearch`) and appends oldest-first,
 * so every read is reversed on the way in and reversed back on the way out —
 * otherwise deleting an entry here would silently flip the order for ProductView.
 */
export function useRecentSearches() {
  const searches = ref(read())
  const hadSearches = ref(searches.value.length > 0)

  // The screen shows "no quedó nada en el historial" only when the person emptied
  // it themselves; a brand-new user gets the explainer instead (artboard 7b).
  const wasEmptiedByHand = computed(() => hadSearches.value && searches.value.length === 0)

  function read() {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return []

    try {
      const stored = JSON.parse(raw)
      return Array.isArray(stored) ? [...stored].reverse() : []
    } catch (error) {
      console.error('[useRecentSearches] -> read(), historial ilegible:', error)
      return []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...searches.value].reverse()))
  }

  // Name alone is not an identity: the same product name exists under several
  // brands, and removing one must not take the others with it.
  function remove(search) {
    searches.value = searches.value.filter(
      (entry) => !(entry.name === search.name && entry.brand === search.brand)
    )
    persist()
  }

  function clear() {
    searches.value = []
    persist()
  }

  return { searches, wasEmptiedByHand, remove, clear }
}
