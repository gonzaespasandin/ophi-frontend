import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useToast } from './useToast.js'

function inScope(callback) {
  const scope = effectScope()
  const api = scope.run(callback)

  return { ...api, stop: () => scope.stop() }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useToast', () => {
  it('starts with nothing to announce', () => {
    const { toast } = inScope(() => useToast())

    expect(toast.value).toEqual({ message: null, type: null })
  })

  it('shows a success message by default', () => {
    const { toast, showToast } = inScope(() => useToast())

    showToast('Perfil guardado')

    expect(toast.value).toEqual({ message: 'Perfil guardado', type: 'success' })
  })

  it('shows an error message when the type is given', () => {
    const { toast, showToast } = inScope(() => useToast())

    showToast('No pudimos guardar los cambios', 'error')

    expect(toast.value).toEqual({ message: 'No pudimos guardar los cambios', type: 'error' })
  })

  it('auto dismisses after four seconds', () => {
    const { toast, showToast } = inScope(() => useToast())

    showToast('Perfil guardado')
    vi.advanceTimersByTime(3999)

    expect(toast.value.message).toBe('Perfil guardado')

    vi.advanceTimersByTime(1)

    expect(toast.value).toEqual({ message: null, type: null })
  })

  it('does not let an earlier message timer cut short a later message', () => {
    const { toast, showToast } = inScope(() => useToast())

    showToast('Perfil guardado')
    vi.advanceTimersByTime(500)
    showToast('No pudimos guardar los cambios', 'error')

    vi.advanceTimersByTime(3500)

    expect(toast.value).toEqual({ message: 'No pudimos guardar los cambios', type: 'error' })

    vi.advanceTimersByTime(500)

    expect(toast.value).toEqual({ message: null, type: null })
  })

  it('hides immediately and cancels the pending auto dismiss', () => {
    const { toast, showToast, hideToast } = inScope(() => useToast())

    showToast('Perfil guardado')
    hideToast()

    expect(toast.value).toEqual({ message: null, type: null })

    showToast('Novedades actualizadas')
    vi.advanceTimersByTime(3000)

    expect(toast.value.message).toBe('Novedades actualizadas')
  })

  it('leaves no timer pending once its scope is disposed', () => {
    const { toast, showToast, stop } = inScope(() => useToast())

    showToast('Perfil guardado')
    stop()
    vi.advanceTimersByTime(10000)

    expect(toast.value).toEqual({ message: 'Perfil guardado', type: 'success' })
    expect(vi.getTimerCount()).toBe(0)
  })
})
