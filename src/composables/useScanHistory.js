import { ref } from 'vue'
import { getLatestScans } from '../services/history.js'

/**
 * Latest scans for the home screen, exposed as a single state machine so the
 * card never has to juggle loading, error and empty flags on its own.
 */
export function useScanHistory() {
  const scans = ref([])
  const state = ref('loading')

  async function load() {
    state.value = 'loading'

    try {
      const result = await getLatestScans()
      scans.value = result ?? []
      state.value = scans.value.length > 0 ? 'ready' : 'empty'
    } catch (error) {
      console.error('[useScanHistory] -> load(), Error:', error)
      scans.value = []
      state.value = 'error'
    }
  }

  return { scans, state, load }
}
