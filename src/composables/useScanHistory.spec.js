import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useScanHistory } from './useScanHistory.js'
import { getLatestScans } from '../services/history.js'

vi.mock('../services/history.js', () => ({ getLatestScans: vi.fn() }))

describe('useScanHistory', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('starts in the loading state', () => {
    const { state, scans } = useScanHistory()

    expect(state.value).toBe('loading')
    expect(scans.value).toEqual([])
  })

  it('lands on ready with the scans it fetched', async () => {
    getLatestScans.mockResolvedValue([{ id: 1 }, { id: 2 }])
    const { state, scans, load } = useScanHistory()

    await load()

    expect(state.value).toBe('ready')
    expect(scans.value).toHaveLength(2)
  })

  it('lands on empty when the user has never scanned', async () => {
    getLatestScans.mockResolvedValue([])
    const { state, load } = useScanHistory()

    await load()

    expect(state.value).toBe('empty')
  })

  it('lands on error when the request fails', async () => {
    getLatestScans.mockRejectedValue(new Error('offline'))
    const { state, scans, load } = useScanHistory()

    await load()

    expect(state.value).toBe('error')
    expect(scans.value).toEqual([])
  })

  it('recovers on a retry after a failure', async () => {
    getLatestScans.mockRejectedValueOnce(new Error('offline'))
    const { state, load } = useScanHistory()

    await load()
    getLatestScans.mockResolvedValue([{ id: 1 }])
    await load()

    expect(state.value).toBe('ready')
  })
})
