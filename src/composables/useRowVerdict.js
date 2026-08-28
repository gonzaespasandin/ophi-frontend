import { computed, unref } from 'vue'
import { useProductVerdict } from './useProductVerdict.js'

/**
 * The single-line reading of a product for one result row.
 *
 * The search endpoint already eager-loads `ingredients.parents`, so the same
 * matching that powers the product screen runs client-side per row — no extra
 * request, no second copy of the rules. This wrapper exists only to collapse
 * that rich result into the one sentence a row has space for.
 */
export function useRowVerdict(profilesSource, ingredientsSource) {
  const { verdict, unsafeProfiles } = useProductVerdict(profilesSource, ingredientsSource)

  const profiles = computed(() => unref(profilesSource) ?? [])
  const ingredients = computed(() => unref(ingredientsSource) ?? [])

  const unsafeCount = computed(() => unsafeProfiles.value.length)
  const isSingleProfile = computed(() => profiles.value.length <= 1)

  // "Unknown" covers two very different holes and the row is the only place the
  // person can tell them apart: the product has no ingredient list, or nobody in
  // the household declared a restriction to compare it against. Naming the wrong
  // one would send them to fix the wrong thing.
  const label = computed(() => {
    if (verdict.value === 'unknown') {
      return ingredients.value.length === 0
        ? 'Sin ingredientes cargados'
        : 'Sin restricciones cargadas'
    }

    if (verdict.value === 'safe') {
      return isSingleProfile.value ? 'Apto para vos' : 'Apto para todos'
    }

    return isSingleProfile.value ? 'No apto para vos' : `No apto para ${unsafeCount.value}`
  })

  return { verdict, unsafeCount, label }
}
