import { ref } from 'vue'
import { getMatchesByName } from '../services/product'

const DEBOUNCE_MS = 300

/**
 * Debounced product suggestions for the search field.
 *
 * Status is a single value instead of separate flags because the screen renders
 * one panel at a time: an empty answer ("Sin coincidencias") and an untouched
 * field are different states and used to look identical.
 */
export function useSearchSuggestions({ delay = DEBOUNCE_MS } = {}) {
  const suggestions = ref([])
  const status = ref('idle')

  let timer = null
  // Answers can come back out of order; only the newest request may write.
  let latestRequest = 0

  function search(query) {
    clearTimeout(timer)

    const trimmed = query.trim()

    if (!trimmed) {
      reset()
      return
    }

    timer = setTimeout(() => run(trimmed), delay)
  }

  async function run(query) {
    const request = ++latestRequest
    status.value = 'loading'

    try {
      const result = await getMatchesByName(query)

      if (request !== latestRequest) return

      // The service answers with the HTTP status code instead of throwing when
      // the request fails, so anything that is not a list counts as no matches.
      suggestions.value = Array.isArray(result) ? result : []
    } catch (error) {
      if (request !== latestRequest) return

      console.error('[useSearchSuggestions] -> run(), Error:', error)
      suggestions.value = []
    }

    status.value = suggestions.value.length > 0 ? 'ready' : 'empty'
  }

  function reset() {
    latestRequest++
    suggestions.value = []
    status.value = 'idle'
  }

  function cancel() {
    clearTimeout(timer)
    latestRequest++
  }

  return { suggestions, status, search, cancel }
}
