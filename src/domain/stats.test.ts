import { describe, expect, it } from 'vitest'

import { getLocalDateKey, getRecentDailyCounts } from './stats'

describe('stats helpers', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    const timestamp = new Date(2026, 9, 1, 10, 30).getTime()

    expect(getLocalDateKey(timestamp)).toBe('2026-10-01')
  })

  it('counts sessions per day and returns a continuous recent range', () => {
    const now = new Date(2026, 9, 1, 12, 0).getTime()
    const today = new Date(2026, 9, 1, 10, 0).getTime()
    const yesterday = new Date(2026, 8, 30, 10, 0).getTime()

    const counts = getRecentDailyCounts([today, today, yesterday], 7, now)

    expect(counts).toHaveLength(7)
    expect(counts.at(-1)).toEqual({ date: '2026-10-01', count: 2 })
    expect(counts.at(-2)).toEqual({ date: '2026-09-30', count: 1 })
    expect(counts[0]).toEqual({ date: '2026-09-25', count: 0 })
  })
})
