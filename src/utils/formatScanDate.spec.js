import { describe, expect, it } from 'vitest'
import { formatScanDate } from './formatScanDate.js'

const now = new Date(2026, 7, 16, 20, 0)

describe('formatScanDate', () => {
  it('labels a scan from today with "Hoy" and its time', () => {
    expect(formatScanDate(new Date(2026, 7, 16, 14, 32), now)).toBe('Hoy · 14:32')
  })

  it('labels a scan from the previous calendar day with "Ayer"', () => {
    expect(formatScanDate(new Date(2026, 7, 15, 19, 7), now)).toBe('Ayer · 19:07')
  })

  it('treats a scan minutes ago but on the previous day as "Ayer"', () => {
    const midnight = new Date(2026, 7, 16, 0, 20)

    expect(formatScanDate(new Date(2026, 7, 15, 23, 50), midnight)).toBe('Ayer · 23:50')
  })

  it('falls back to day and month for older scans', () => {
    expect(formatScanDate(new Date(2026, 7, 12, 9, 15), now)).toBe('12/08 · 09:15')
  })

  it('adds the year once the scan is from another one', () => {
    expect(formatScanDate(new Date(2025, 7, 12, 9, 15), now)).toBe('12/08/2025 · 09:15')
  })

  it('still says "Ayer" across a new year boundary', () => {
    const newYear = new Date(2026, 0, 1, 10, 0)

    expect(formatScanDate(new Date(2025, 11, 31, 23, 40), newYear)).toBe('Ayer · 23:40')
  })

  it('returns an empty string for an unparsable value', () => {
    expect(formatScanDate('no es una fecha', now)).toBe('')
  })
})
