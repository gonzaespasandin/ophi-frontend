import { describe, expect, it } from 'vitest'
import { checkPasswordRules, isPasswordValid } from './passwordRules.js'

const met = password => checkPasswordRules(password).filter(rule => rule.met).map(rule => rule.key)

describe('checkPasswordRules', () => {
  // The backend validates min:8 plus one lowercase and one uppercase. The list
  // mirrors those three so the screen never asks for something the API ignores.
  it('lists the three rules the backend enforces', () => {
    expect(checkPasswordRules('').map(rule => rule.key)).toEqual(['length', 'uppercase', 'lowercase'])
  })

  it('marks every rule as unmet for an empty password', () => {
    expect(met('')).toEqual([])
  })

  it('marks the length rule from the eighth character', () => {
    expect(met('abcdefg')).not.toContain('length')
    expect(met('abcdefgh')).toContain('length')
  })

  it('marks the uppercase rule once there is a capital letter', () => {
    expect(met('sinmayuscula')).not.toContain('uppercase')
    expect(met('conMayuscula')).toContain('uppercase')
  })

  it('marks the lowercase rule once there is a small letter', () => {
    expect(met('SINMINUSCULA')).not.toContain('lowercase')
    expect(met('CONMINUSCULa')).toContain('lowercase')
  })

  // The API regex is ASCII-only and carries no unicode modifier, so a password
  // whose only capital is accented passes here and is rejected there.
  it('does not count an accented capital as the uppercase the API asks for', () => {
    expect(met('Ñoquis12')).not.toContain('uppercase')
    expect(met('Ñoquis12')).toContain('lowercase')
  })

  it('does not count an accented letter as the lowercase the API asks for', () => {
    expect(met('ARROZÑ123')).not.toContain('lowercase')
  })

  it('gives every rule a label to show', () => {
    checkPasswordRules('').forEach(rule => expect(rule.label).toBeTruthy())
  })
})

describe('isPasswordValid', () => {
  it('accepts a password that meets the three rules', () => {
    expect(isPasswordValid('SecretaSegura')).toBe(true)
  })

  it('rejects a password that misses any rule', () => {
    expect(isPasswordValid('secretasegura')).toBe(false)
    expect(isPasswordValid('SECRETASEGURA')).toBe(false)
    expect(isPasswordValid('Corta1')).toBe(false)
  })
})
