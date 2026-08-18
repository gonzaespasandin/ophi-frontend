/**
 * The blue band slides up when it changes height — entering /welcome, and moving
 * from there to /login or to the wizard. It must NOT slide between wizard steps:
 * App.vue keys RouterView by route.path, so every step remounts the view, and
 * replaying the rise six times reads as the screen rebuilding itself instead of
 * its content changing.
 *
 * Module scope on purpose: the previous screen has to outlive the component that
 * asked about it, which is exactly the one being remounted.
 */
let previousScreen = null

export function useAuthBandEntrance(screen) {
  const shouldAnimate = previousScreen !== screen
  previousScreen = screen

  return shouldAnimate
}

export function resetAuthBandEntrance() {
  previousScreen = null
}
