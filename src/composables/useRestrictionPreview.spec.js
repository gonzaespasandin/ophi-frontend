import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useRestrictionPreview } from './useRestrictionPreview.js'

const named = (...names) => names.map((name, index) => ({ id: index + 1, name }))

describe('useRestrictionPreview', () => {
  it('reports no restrictions for an empty list', () => {
    const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(() => [])

    expect(hasRestrictions.value).toBe(false)
    expect(preview.value).toBe('')
    expect(hiddenCount.value).toBe(0)
  })

  it('previews a single restriction without hiding anything', () => {
    const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(() => named('Gluten'))

    expect(hasRestrictions.value).toBe(true)
    expect(preview.value).toBe('Gluten')
    expect(hiddenCount.value).toBe(0)
  })

  it('previews exactly two restrictions without hiding anything', () => {
    const { preview, hiddenCount } = useRestrictionPreview(() => named('Gluten', 'Lactosa'))

    expect(preview.value).toBe('Gluten, Lactosa')
    expect(hiddenCount.value).toBe(0)
  })

  it('previews the first two of five restrictions and counts the rest', () => {
    const { preview, hiddenCount } = useRestrictionPreview(() =>
      named('Gluten', 'Lactosa', 'Maní', 'Huevo', 'Soja')
    )

    expect(preview.value).toBe('Gluten, Lactosa')
    expect(hiddenCount.value).toBe(3)
  })

  it('treats undefined ingredients as empty instead of throwing', () => {
    const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(() => undefined)

    expect(hasRestrictions.value).toBe(false)
    expect(preview.value).toBe('')
    expect(hiddenCount.value).toBe(0)
  })

  it('treats null ingredients as empty instead of throwing', () => {
    const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(() => null)

    expect(hasRestrictions.value).toBe(false)
    expect(preview.value).toBe('')
    expect(hiddenCount.value).toBe(0)
  })

  it('honours a custom preview limit', () => {
    const { preview, hiddenCount } = useRestrictionPreview(
      () => named('Gluten', 'Lactosa', 'Maní', 'Huevo', 'Soja'),
      3
    )

    expect(preview.value).toBe('Gluten, Lactosa, Maní')
    expect(hiddenCount.value).toBe(2)
  })

  it('accepts a plain array instead of a getter', () => {
    const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(
      named('Gluten', 'Lactosa', 'Maní')
    )

    expect(hasRestrictions.value).toBe(true)
    expect(preview.value).toBe('Gluten, Lactosa')
    expect(hiddenCount.value).toBe(1)
  })

  it('recomputes when the source ref changes', () => {
    const ingredients = ref(named('Gluten'))
    const { preview, hiddenCount } = useRestrictionPreview(ingredients)

    expect(preview.value).toBe('Gluten')

    ingredients.value = named('Maní', 'Huevo', 'Soja')

    expect(preview.value).toBe('Maní, Huevo')
    expect(hiddenCount.value).toBe(1)
  })
})
