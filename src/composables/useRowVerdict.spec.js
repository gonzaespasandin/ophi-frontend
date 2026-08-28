import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useRowVerdict } from './useRowVerdict.js'

const gluten = { id: 10, name: 'Gluten' }
const nuts = { id: 20, name: 'Frutos secos' }

const nicolas = { id: 1, name: 'Nicolás', ingredients: [gluten] }
const martina = { id: 2, name: 'Martina', ingredients: [nuts] }
const valentina = { id: 3, name: 'Valentina', ingredients: [] }

const wheat = { id: 100, name: 'Harina de trigo', parents: [gluten] }
const almonds = { id: 101, name: 'Almendras molidas', parents: [nuts] }
const salt = { id: 102, name: 'Sal', parents: [] }

function build(profiles, ingredients) {
  return useRowVerdict(ref(profiles), ref(ingredients))
}

describe('useRowVerdict', () => {
  it('clears the whole household when nobody is hit', () => {
    const { verdict, label } = build([nicolas, martina], [salt])

    expect(verdict.value).toBe('safe')
    expect(label.value).toBe('Apto para todos')
  })

  it('counts how many profiles the row blocks', () => {
    const { verdict, unsafeCount, label } = build([nicolas, martina], [wheat, almonds])

    expect(verdict.value).toBe('unsafe')
    expect(unsafeCount.value).toBe(2)
    expect(label.value).toBe('No apto para 2')
  })

  it('speaks in the first person when the household is a single profile', () => {
    expect(build([nicolas], [salt]).label.value).toBe('Apto para vos')
    expect(build([nicolas], [wheat]).label.value).toBe('No apto para vos')
  })

  // The incomplete database makes this the most frequent row, so it names the
  // real reason instead of borrowing the green one.
  it('says the product has no ingredients loaded rather than calling it safe', () => {
    const { verdict, label } = build([nicolas], [])

    expect(verdict.value).toBe('unknown')
    expect(label.value).toBe('Sin ingredientes cargados')
  })

  it('blames the missing restrictions when it is the profile that has none', () => {
    const { verdict, label } = build([valentina], [wheat])

    expect(verdict.value).toBe('unknown')
    expect(label.value).toBe('Sin restricciones cargadas')
  })

  it('holds no verdict when the household has not loaded yet', () => {
    const { verdict, label } = build([], [wheat])

    expect(verdict.value).toBe('unknown')
    expect(label.value).toBe('Sin restricciones cargadas')
  })
})
