import { computed, toValue } from 'vue'

export function useRestrictionPreview(getIngredients, limit = 2) {
  const ingredients = computed(() => toValue(getIngredients) ?? [])

  const hasRestrictions = computed(() => ingredients.value.length > 0)

  const preview = computed(() =>
    ingredients.value.slice(0, limit).map((ingredient) => ingredient.name).join(', ')
  )

  const hiddenCount = computed(() => Math.max(ingredients.value.length - limit, 0))

  return { hasRestrictions, preview, hiddenCount }
}
