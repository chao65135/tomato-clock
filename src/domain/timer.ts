export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsUntilLongBreak: number
  autoStartNext: boolean
}

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  deadline: number | null
  remainingMs: number
  completedFocusSessions: number
  completedSessions: number[]
  settings: TimerSettings
}

export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  | { type: 'skip' }
  | { type: 'tick'; now: number }
  | { type: 'updateSettings'; settings: Partial<TimerSettings> }

const MINUTE_MS = 60_000

export const DEFAULT_TIMER_SETTINGS: TimerSettings = Object.freeze({
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartNext: false,
})

function clampInteger(
  value: number,
  fallback: number,
  min: number,
  max: number,
) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}

export function normalizeSettings(
  settings: Partial<TimerSettings> = {},
): TimerSettings {
  return {
    focusMinutes: clampInteger(
      settings.focusMinutes ?? DEFAULT_TIMER_SETTINGS.focusMinutes,
      DEFAULT_TIMER_SETTINGS.focusMinutes,
      1,
      180,
    ),
    shortBreakMinutes: clampInteger(
      settings.shortBreakMinutes ?? DEFAULT_TIMER_SETTINGS.shortBreakMinutes,
      DEFAULT_TIMER_SETTINGS.shortBreakMinutes,
      1,
      60,
    ),
    longBreakMinutes: clampInteger(
      settings.longBreakMinutes ?? DEFAULT_TIMER_SETTINGS.longBreakMinutes,
      DEFAULT_TIMER_SETTINGS.longBreakMinutes,
      1,
      120,
    ),
    sessionsUntilLongBreak: clampInteger(
      settings.sessionsUntilLongBreak ??
        DEFAULT_TIMER_SETTINGS.sessionsUntilLongBreak,
      DEFAULT_TIMER_SETTINGS.sessionsUntilLongBreak,
      1,
      12,
    ),
    autoStartNext:
      typeof settings.autoStartNext === 'boolean'
        ? settings.autoStartNext
        : DEFAULT_TIMER_SETTINGS.autoStartNext,
  }
}

export function durationForMode(
  mode: TimerMode,
  settings: TimerSettings,
): number {
  if (mode === 'focus') {
    return settings.focusMinutes * MINUTE_MS
  }

  if (mode === 'longBreak') {
    return settings.longBreakMinutes * MINUTE_MS
  }

  return settings.shortBreakMinutes * MINUTE_MS
}

export function createTimerState(
  settings: Partial<TimerSettings> = {},
): TimerState {
  const normalizedSettings = normalizeSettings(settings)

  return {
    mode: 'focus',
    status: 'idle',
    deadline: null,
    remainingMs: durationForMode('focus', normalizedSettings),
    completedFocusSessions: 0,
    completedSessions: [],
    settings: normalizedSettings,
  }
}

export function getRemainingMs(
  state: TimerState,
  now: number = Date.now(),
): number {
  if (state.status === 'running' && state.deadline !== null) {
    return Math.max(0, state.deadline - now)
  }

  return Math.max(0, state.remainingMs)
}

function isLongBreakDue(
  completedFocusSessions: number,
  sessionsUntilLongBreak: number,
) {
  return (
    completedFocusSessions > 0 &&
    completedFocusSessions % sessionsUntilLongBreak === 0
  )
}

export function getNextMode(
  currentMode: TimerMode,
  completedFocusSessions: number,
  settings: TimerSettings,
  focusWasCompleted: boolean,
): TimerMode {
  if (currentMode !== 'focus') {
    return 'focus'
  }

  if (
    focusWasCompleted &&
    isLongBreakDue(completedFocusSessions, settings.sessionsUntilLongBreak)
  ) {
    return 'longBreak'
  }

  return 'shortBreak'
}

export function timerReducer(
  state: TimerState,
  action: TimerAction,
): TimerState {
  switch (action.type) {
    case 'start': {
      if (state.status !== 'idle' && state.status !== 'paused') {
        return state
      }

      const remainingMs =
        state.status === 'paused'
          ? state.remainingMs
          : durationForMode(state.mode, state.settings)

      if (remainingMs <= 0) {
        return state
      }

      return {
        ...state,
        status: 'running',
        deadline: action.now + remainingMs,
        remainingMs,
      }
    }

    case 'pause': {
      if (state.status !== 'running' || state.deadline === null) {
        return state
      }

      return {
        ...state,
        status: 'paused',
        remainingMs: Math.max(0, state.deadline - action.now),
        deadline: null,
      }
    }

    case 'reset': {
      return {
        ...state,
        status: 'idle',
        deadline: null,
        remainingMs: durationForMode(state.mode, state.settings),
      }
    }

    case 'skip': {
      const focusWasCompleted =
        state.mode === 'focus' && state.status === 'completed'
      const nextMode = getNextMode(
        state.mode,
        state.completedFocusSessions,
        state.settings,
        focusWasCompleted,
      )

      return {
        ...state,
        mode: nextMode,
        status: 'idle',
        deadline: null,
        remainingMs: durationForMode(nextMode, state.settings),
      }
    }

    case 'tick': {
      if (
        state.status !== 'running' ||
        state.deadline === null ||
        action.now < state.deadline
      ) {
        return state
      }

      const completedFocusSessions =
        state.mode === 'focus'
          ? state.completedFocusSessions + 1
          : state.completedFocusSessions

      return {
        ...state,
        status: 'completed',
        deadline: null,
        remainingMs: 0,
        completedFocusSessions,
        completedSessions:
          state.mode === 'focus'
            ? [...state.completedSessions, state.deadline ?? action.now]
            : state.completedSessions,
      }
    }

    case 'updateSettings': {
      const settings = normalizeSettings({
        ...state.settings,
        ...action.settings,
      })

      return {
        ...state,
        settings,
        remainingMs:
          state.status === 'idle'
            ? durationForMode(state.mode, settings)
            : state.remainingMs,
      }
    }
  }
}
