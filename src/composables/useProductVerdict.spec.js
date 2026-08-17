import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useProductVerdict } from './useProductVerdict.js'

const gluten = { id: 10, name: 'Gluten' }
const nuts = { id: 20, name: 'Frutos secos' }

const nicolas = { id: 1, name: 'Nicolás', avatar_color: '#007050', ingredients: [gluten], ingredient_ids: [10] }
const martina = { id: 2, name: 'Martina', avatar_color: '#B91C1C', ingredients: [nuts], ingredient_ids: [20] }
const valentina = { id: 3, name: 'Valentina', avatar_color: '#6D28D9', ingredients: [], ingredient_ids: [] }

const wheat = { id: 100, name: 'Harina de trigo', parents: [gluten] }
const almonds = { id: 101, name: 'Almendras molidas', parents: [nuts] }
const salt = { id: 102, name: 'Sal', parents: [] }
const peanutTrace = { id: 103, name: 'Maní', parents: [nuts], pivot: { is_trace: 1 } }

function build(profiles, ingredients) {
  return useProductVerdict(ref(profiles), ref(ingredients))
}

describe('useProductVerdict', () => {
  it('is safe when every profile with restrictions clears the product', () => {
    const { verdict, conflicts } = build([nicolas, martina], [salt])

    expect(verdict.value).toBe('safe')
    expect(conflicts.value).toEqual([])
  })

  it('is unsafe as soon as one profile hits a conflict', () => {
    const { verdict, unsafeProfiles, safeProfiles } = build([nicolas, martina], [wheat, salt])

    expect(verdict.value).toBe('unsafe')
    expect(unsafeProfiles.value.map(p => p.name)).toEqual(['Nicolás'])
    expect(safeProfiles.value.map(p => p.name)).toEqual(['Martina'])
  })

  it('has no verdict to give when nobody loaded restrictions', () => {
    const { verdict, unrestrictedProfiles } = build([valentina], [wheat])

    expect(verdict.value).toBe('unknown')
    expect(unrestrictedProfiles.value.map(p => p.name)).toEqual(['Valentina'])
  })

  it('has no verdict to give when the product has no ingredients loaded', () => {
    const { verdict } = build([nicolas], [])

    expect(verdict.value).toBe('unknown')
  })

  it('names the restriction each conflicting ingredient collides with', () => {
    const { conflicts } = build([nicolas, martina], [wheat, almonds, salt])

    expect(conflicts.value).toEqual([
      {
        id: 100,
        name: 'Harina de trigo',
        restrictions: ['Gluten'],
        profiles: [{ id: 1, name: 'Nicolás', avatar_color: '#007050' }],
      },
      {
        id: 101,
        name: 'Almendras molidas',
        restrictions: ['Frutos secos'],
        profiles: [{ id: 2, name: 'Martina', avatar_color: '#B91C1C' }],
      },
    ])
  })

  it('matches a restriction listed on the ingredient itself, not only on its parents', () => {
    const { conflicts } = build([martina], [{ id: 20, name: 'Frutos secos', parents: [] }])

    expect(conflicts.value[0].restrictions).toEqual(['Frutos secos'])
  })

  it('lists every profile a single ingredient affects', () => {
    const alsoGluten = { ...martina, ingredients: [gluten], ingredient_ids: [10] }
    const { conflicts } = build([nicolas, alsoGluten], [wheat])

    expect(conflicts.value[0].profiles.map(p => p.name)).toEqual(['Nicolás', 'Martina'])
  })

  it('keeps the restrictions each unsafe profile hit, for the breakdown', () => {
    const { unsafeProfiles } = build([nicolas, martina], [wheat, almonds])

    expect(unsafeProfiles.value[0].restrictions).toEqual(['Gluten'])
    expect(unsafeProfiles.value[1].restrictions).toEqual(['Frutos secos'])
  })

  // Traces are a risk of another nature: they get their own block instead of a
  // conflict row, but they still keep the product away from whoever reacts.
  it('pulls traces out of the conflict rows', () => {
    const { conflicts, traces } = build([martina], [salt, peanutTrace])

    expect(conflicts.value).toEqual([])
    expect(traces.value).toEqual([
      {
        id: 103,
        name: 'Maní',
        restrictions: ['Frutos secos'],
        profiles: [{ id: 2, name: 'Martina', avatar_color: '#B91C1C' }],
      },
    ])
  })

  it('still lists a trace that hits nobody, since the package does not promise it is absent', () => {
    const { traces, verdict } = build([nicolas], [salt, peanutTrace])

    expect(traces.value).toEqual([
      { id: 103, name: 'Maní', restrictions: [], profiles: [] },
    ])
    expect(verdict.value).toBe('safe')
  })

  it('still refuses the product when a trace hits a restriction', () => {
    const { verdict, unsafeProfiles } = build([martina], [salt, peanutTrace])

    expect(verdict.value).toBe('unsafe')
    expect(unsafeProfiles.value.map(p => p.name)).toEqual(['Martina'])
  })

  it('leaves the untouched ingredients aside, traces excluded', () => {
    const { cleanIngredients } = build([nicolas], [wheat, salt, peanutTrace])

    expect(cleanIngredients.value).toEqual(['Sal'])
  })

  it('narrows the conflicts down to one profile when asked to', () => {
    const { conflicts, filterProfileId } = build([nicolas, martina], [wheat, almonds])

    filterProfileId.value = 2

    expect(conflicts.value.map(c => c.name)).toEqual(['Almendras molidas'])
  })

  it('survives a product or a household that never arrived', () => {
    const { verdict, conflicts, cleanIngredients } = build(null, null)

    expect(verdict.value).toBe('unknown')
    expect(conflicts.value).toEqual([])
    expect(cleanIngredients.value).toEqual([])
  })
})
