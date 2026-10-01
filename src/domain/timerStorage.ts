import type { TimerSettings, TimerState } from './timer'
import { normalizeSettings } from './timer'

export const TIMER_STORAGE_KEY = 'tomato-clock.timer-state.v3'

const STORAGE_VERSION = 3

interface PersistedTimerState {
  version: number
  state: TimerState
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const timerModes = new Set(['focus', 'shortBreak', 'longBreak'])
const timerStatuses = new Set(['idle', 'running', 'paused', 'completed'])

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isTimerSettings(value: unknown): value is TimerSettings {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const settings = value as Record<string, unknown>

  return (
    isFiniteNonNegativeNumber(settings.focusMinutes) &&
    isFiniteNonNegativeNumber(settings.shortBreakMinutes) &&
    isFiniteNonNegativeNumber(settings.longBreakMinutes) &&
    isFiniteNonNegativeNumber(settings.sessionsUntilLongBreak) &&
    typeof settings.autoStartNext === 'boolean'
  )
}

function isTimerState(value: unknown): value is TimerState {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const state = value as Record<string, unknown>

  return (
    typeof state.mode === 'string' &&
    timerModes.has(state.mode) &&
    typeof state.status === 'string' &&
    timerStatuses.has(state.status) &&
    (state.deadline === null ||
      (typeof state.deadline === 'number' &&
        Number.isFinite(state.deadline))) &&
    isFiniteNonNegativeNumber(state.remainingMs) &&
    isFiniteNonNegativeNumber(state.completedFocusSessions) &&
    Array.isArray(state.completedSessions) &&
    state.completedSessions.every(isFiniteNonNegativeNumber) &&
    isTimerSettings(state.settings)
  )
}

export function serializeTimerState(state: TimerState): string {
  const payload: PersistedTimerState = {
    version: STORAGE_VERSION,
    state,
  }

  return JSON.stringify(payload)
}

export function parseTimerState(raw: string | null): TimerState | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedTimerState>

    if (parsed.version !== STORAGE_VERSION || !isTimerState(parsed.state)) {
      return null
    }

    return {
      ...parsed.state,
      settings: normalizeSettings(parsed.state.settings),
    }
  } catch {
    return null
  }
}

export interface TimerStorage {
  load: () => TimerState | null
  save: (state: TimerState) => void
  clear: () => void
}

export function createTimerStorage(storage: StorageLike): TimerStorage {
  return {
    load: () => {
      try {
        return parseTimerState(storage.getItem(TIMER_STORAGE_KEY))
      } catch {
        // localStorage 被禁用（隐私模式、安全策略）时按无数据处理
        return null
      }
    },
    save: (state) => {
      try {
        storage.setItem(TIMER_STORAGE_KEY, serializeTimerState(state))
      } catch {
        // 写入失败（配额、禁用存储）不应中断计时
      }
    },
    clear: () => {
      try {
        storage.removeItem(TIMER_STORAGE_KEY)
      } catch {
        // 同上，忽略即可
      }
    },
  }
}

export function createLocalTimerStorage(): TimerStorage {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('localStorage is not available in this environment.')
  }

  return createTimerStorage(window.localStorage)
}
