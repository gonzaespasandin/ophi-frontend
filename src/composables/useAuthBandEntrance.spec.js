import { beforeEach, describe, expect, it } from 'vitest'
import { resetAuthBandEntrance, useAuthBandEntrance } from './useAuthBandEntrance.js'

describe('useAuthBandEntrance', () => {
  beforeEach(resetAuthBandEntrance)

  it('animates the first auth screen of a visit', () => {
    expect(useAuthBandEntrance('welcome')).toBe(true)
  })

  it('animates again when moving to a different auth screen', () => {
    useAuthBandEntrance('welcome')

    expect(useAuthBandEntrance('login')).toBe(true)
  })

  // App.vue keys RouterView by route.path, so /register/terms -> /register/allergies
  // remounts the whole view. The band keeps its height between wizard steps, so
  // replaying the rise there would read as the screen rebuilding itself each time.
  it('does not animate between steps of the same screen', () => {
    useAuthBandEntrance('register')

    expect(useAuthBandEntrance('register')).toBe(false)
  })

  it('animates once more after leaving the screen and coming back', () => {
    useAuthBandEntrance('register')
    useAuthBandEntrance('login')

    expect(useAuthBandEntrance('register')).toBe(true)
  })
})
