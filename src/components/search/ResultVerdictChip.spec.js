import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultVerdictChip from './ResultVerdictChip.vue'

const gluten = { id: 10, name: 'Gluten' }
const nicolas = { id: 1, name: 'Nicolás', ingredients: [gluten] }
const martina = { id: 2, name: 'Martina', ingredients: [gluten] }

const wheat = { id: 100, name: 'Harina de trigo', parents: [gluten] }
const salt = { id: 102, name: 'Sal', parents: [] }

function mountChip(props) {
  return mount(ResultVerdictChip, { props })
}

describe('ResultVerdictChip', () => {
  it('reads green when the row clears every profile', () => {
    const wrapper = mountChip({ profiles: [nicolas, martina], ingredients: [salt] })

    expect(wrapper.text()).toContain('Apto para todos')
    expect(wrapper.get('[data-testid="verdict-chip"]').classes()).toContain('bg-ophi-green-soft')
  })

  it('reads red and counts the profiles it blocks', () => {
    const wrapper = mountChip({ profiles: [nicolas, martina], ingredients: [wheat] })

    expect(wrapper.text()).toContain('No apto para 2')
    expect(wrapper.get('[data-testid="verdict-chip"]').classes()).toContain('bg-ophi-danger-soft')
  })

  // Green would be a lie here and the database is incomplete often enough that
  // this is the most frequent chip on the screen.
  it('stays neutral instead of borrowing the green when there is nothing to compare', () => {
    const wrapper = mountChip({ profiles: [nicolas], ingredients: [] })

    expect(wrapper.text()).toContain('Sin ingredientes cargados')
    const chip = wrapper.get('[data-testid="verdict-chip"]')
    expect(chip.classes()).toContain('bg-ophi-surface')
    expect(chip.classes()).not.toContain('bg-ophi-green-soft')
  })

  it('hides its icon from assistive tech, the words already carry the verdict', () => {
    const wrapper = mountChip({ profiles: [nicolas], ingredients: [wheat] })

    expect(wrapper.get('i').attributes('aria-hidden')).toBe('true')
  })
})
