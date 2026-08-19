/**
 * The three rules the API enforces on a password (min:8 plus one lowercase and
 * one uppercase). They live here so the register step and the reset screen ask
 * for exactly the same thing, and so the screen never invents a rule the
 * backend ignores.
 *
 * The letter classes are ASCII on purpose: the API regex is /(?=.*[a-z])(?=.*[A-Z])/
 * with no unicode modifier, so a password whose only capital is "Ñ" satisfies a
 * looser client rule and is still rejected with a 422. A checklist that goes
 * green on a password the server refuses is worse than no checklist.
 */
const RULES = [
  { key: 'length', label: 'Al menos 8 caracteres', isMet: password => password.length >= 8 },
  { key: 'uppercase', label: 'Una letra mayúscula', isMet: password => /[A-Z]/.test(password) },
  { key: 'lowercase', label: 'Una letra minúscula', isMet: password => /[a-z]/.test(password) },
]

export function checkPasswordRules(password = '') {
  return RULES.map(({ key, label, isMet }) => ({ key, label, met: isMet(password) }))
}

export function isPasswordValid(password = '') {
  return RULES.every(({ isMet }) => isMet(password))
}
