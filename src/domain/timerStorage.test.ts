import { describe, expect, it } from 'vitest'

import { createTimerState } from './timer'
import {
  createTimerStorage,
  parseTimerState,
  serializeTimerState,
  TIMER_STORAGE_KEY,
} from './timerStorage'

function createMemoryStorage() {
  const values = new Map<string, string>()

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

describe('timer storage', () => {
  it('round-trips a timer state through JSON', () => {
    const state = createTimerState({ focusMinutes: 30 })
    const parsed = parseTimerState(serializeTimerState(state))

    expect(parsed).toEqual(state)
  })

  it('returns null for missing or invalid data', () => {
    expect(parseTimerState(null)).toBeNull()
    expect(parseTimerState('')).toBeNull()
    expect(parseTimerState('not-json')).toBeNull()
    expect(parseTimerState('{"version":1,"state":{}}')).toBeNull()
    expect(parseTimerState('{"version":4,"state":{}}')).toBeNull()
  })

  it('loads, saves, and clears using the storage adapter', () => {
    const memoryStorage = createMemoryStorage()
    const storage = createTimerStorage(memoryStorage)
    const state = createTimerState({ shortBreakMinutes: 8 })

    expect(storage.load()).toBeNull()

    storage.save(state)

    expect(memoryStorage.getItem(TIMER_STORAGE_KEY)).not.toBeNull()
    expect(storage.load()).toEqual(state)

    storage.clear()

    expect(storage.load()).toBeNull()
  })
})
