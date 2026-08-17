import { ref } from 'vue'
import { getSafeProducts } from '../services/product.js'

/**
 * Products with no ingredient the household avoids. A failed fetch is not worth
 * an error state here: recommendations are a bonus, not the reason to open Ophi.
 */
export function useSafeProducts() {
  const products = ref([])
  const state = ref('loading')

  async function load() {
    state.value = 'loading'

    try {
      const result = await getSafeProducts()
      products.value = result ?? []
    } catch (error) {
      console.error('[useSafeProducts] -> load(), Error:', error)
      products.value = []
    } finally {
      state.value = products.value.length > 0 ? 'ready' : 'empty'
    }
  }

  return { products, state, load }
}
