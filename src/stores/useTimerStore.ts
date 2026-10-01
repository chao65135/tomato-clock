import { create } from 'zustand'

import {
  createTimerState,
  getRemainingMs as calculateRemainingMs,
  timerReducer,
  type TimerSettings,
  type TimerState,
} from '../domain/timer'
import {
  createLocalTimerStorage,
  type TimerStorage,
} from '../domain/timerStorage'

interface TimerStore {
  timer: TimerState
  start: (now?: number) => void
  pause: (now?: number) => void
  reset: () => void
  skip: () => void
  tick: (now?: number) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  getRemainingMs: (now?: number) => number
}

function getBrowserStorage(): TimerStorage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  return createLocalTimerStorage()
}

const browserStorage = getBrowserStorage()
const initialState = browserStorage?.load() ?? createTimerState()

export const useTimerStore = create<TimerStore>()((set, get) => {
  const commit = (timer: TimerState) => {
    browserStorage?.save(timer)
    set({ timer })
  }

  return {
    timer: initialState,
    start: (now = Date.now()) => {
      commit(timerReducer(get().timer, { type: 'start', now }))
    },
    pause: (now = Date.now()) => {
      commit(timerReducer(get().timer, { type: 'pause', now }))
    },
    reset: () => {
      commit(timerReducer(get().timer, { type: 'reset' }))
    },
    skip: () => {
      commit(timerReducer(get().timer, { type: 'skip' }))
    },
    tick: (now = Date.now()) => {
      const nextTimer = timerReducer(get().timer, { type: 'tick', now })

      if (nextTimer !== get().timer) {
        commit(nextTimer)
      }
    },
    updateSettings: (settings) => {
      commit(timerReducer(get().timer, { type: 'updateSettings', settings }))
    },
    getRemainingMs: (now = Date.now()) =>
      calculateRemainingMs(get().timer, now),
  }
})
