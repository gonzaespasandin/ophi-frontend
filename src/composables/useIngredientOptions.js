import { ref } from 'vue'

/**
 * The three pickers of the profile wizard share one shape: fetch a list of
 * ingredient options once, show a skeleton meanwhile, and offer a retry when the
 * fetch fails. Unlike useSafeProducts a failure gets its own state here — without
 * the list nobody can state a restriction, so it is a dead end, not a bonus lost.
 */
export function useIngredientOptions(fetchOptions) {
  const options = ref([])
  const state = ref('loading')

  async function load() {
    state.value = 'loading'

    try {
      options.value = await fetchOptions() ?? []
      state.value = 'ready'
    } catch (error) {
      console.error('[useIngredientOptions] -> load(), Error:', error)
      options.value = []
      state.value = 'error'
    }
  }

  return { options, state, load }
}
