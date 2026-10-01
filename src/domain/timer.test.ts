import { describe, expect, it } from 'vitest'

import { createTimerState, getRemainingMs, timerReducer } from './timer'

const NOW = 1_700_000_000_000
const MINUTE_MS = 60_000

function completeFocusSession(startTime: number) {
  let state = createTimerState()
  state = timerReducer(state, { type: 'start', now: startTime })
  state = timerReducer(state, {
    type: 'tick',
    now: startTime + 25 * MINUTE_MS,
  })

  return state
}

describe('timer domain', () => {
  it('creates an idle focus session with default settings', () => {
    const state = createTimerState()

    expect(state.mode).toBe('focus')
    expect(state.status).toBe('idle')
    expect(state.deadline).toBeNull()
    expect(state.remainingMs).toBe(25 * MINUTE_MS)
    expect(state.completedFocusSessions).toBe(0)
    expect(state.settings.autoStartNext).toBe(false)
  })

  it('starts from idle using the configured duration', () => {
    const state = timerReducer(createTimerState(), {
      type: 'start',
      now: NOW,
    })

    expect(state.status).toBe('running')
    expect(state.deadline).toBe(NOW + 25 * MINUTE_MS)
    expect(getRemainingMs(state, NOW + MINUTE_MS)).toBe(24 * MINUTE_MS)
  })

  it('pauses and preserves the remaining time', () => {
    let state = timerReducer(createTimerState(), {
      type: 'start',
      now: NOW,
    })
    state = timerReducer(state, {
      type: 'pause',
      now: NOW + MINUTE_MS,
    })

    expect(state.status).toBe('paused')
    expect(state.deadline).toBeNull()
    expect(state.remainingMs).toBe(24 * MINUTE_MS)
    expect(getRemainingMs(state, NOW + 10 * MINUTE_MS)).toBe(24 * MINUTE_MS)
  })

  it('resumes a paused session from the remaining time', () => {
    let state = timerReducer(createTimerState(), {
      type: 'start',
      now: NOW,
    })
    state = timerReducer(state, {
      type: 'pause',
      now: NOW + MINUTE_MS,
    })
    state = timerReducer(state, {
      type: 'start',
      now: NOW + 10 * MINUTE_MS,
    })

    expect(state.status).toBe('running')
    expect(state.deadline).toBe(NOW + 10 * MINUTE_MS + 24 * MINUTE_MS)
  })

  it('resets the current session without changing completed counts', () => {
    let state = completeFocusSession(NOW)
    state = timerReducer(state, { type: 'reset' })

    expect(state.mode).toBe('focus')
    expect(state.status).toBe('idle')
    expect(state.deadline).toBeNull()
    expect(state.remainingMs).toBe(25 * MINUTE_MS)
    expect(state.completedFocusSessions).toBe(1)
  })

  it('completes a running focus session on tick', () => {
    let state = timerReducer(createTimerState(), {
      type: 'start',
      now: NOW,
    })
    state = timerReducer(state, {
      type: 'tick',
      now: NOW + 24 * MINUTE_MS,
    })

    expect(state.status).toBe('running')
    expect(state.completedFocusSessions).toBe(0)

    state = timerReducer(state, {
      type: 'tick',
      now: NOW + 25 * MINUTE_MS,
    })

    expect(state.status).toBe('completed')
    expect(state.deadline).toBeNull()
    expect(state.remainingMs).toBe(0)
    expect(state.completedFocusSessions).toBe(1)
    expect(state.completedSessions).toEqual([NOW + 25 * MINUTE_MS])
  })

  it('does not count a break as a completed focus session', () => {
    let state = completeFocusSession(NOW)
    state = timerReducer(state, { type: 'skip' })
    state = timerReducer(state, { type: 'start', now: NOW })
    state = timerReducer(state, {
      type: 'tick',
      now: NOW + 5 * MINUTE_MS,
    })

    expect(state.status).toBe('completed')
    expect(state.completedFocusSessions).toBe(1)
    expect(state.completedSessions).toEqual([NOW + 25 * MINUTE_MS])
  })

  it('skips an unfinished focus session without counting it', () => {
    let state = timerReducer(createTimerState(), {
      type: 'start',
      now: NOW,
    })
    state = timerReducer(state, { type: 'skip' })

    expect(state.mode).toBe('shortBreak')
    expect(state.status).toBe('idle')
    expect(state.remainingMs).toBe(5 * MINUTE_MS)
    expect(state.completedFocusSessions).toBe(0)
  })

  it('moves from a break back to focus', () => {
    let state = completeFocusSession(NOW)
    state = timerReducer(state, { type: 'skip' })
    state = timerReducer(state, { type: 'skip' })

    expect(state.mode).toBe('focus')
    expect(state.status).toBe('idle')
  })

  it('uses a long break after the configured number of focus sessions', () => {
    let state = createTimerState()

    for (let session = 1; session <= 3; session += 1) {
      state = timerReducer(state, { type: 'start', now: NOW })
      state = timerReducer(state, {
        type: 'tick',
        now: NOW + 25 * MINUTE_MS,
      })
      state = timerReducer(state, { type: 'skip' })

      expect(state.mode).toBe('shortBreak')

      state = timerReducer(state, { type: 'skip' })
      expect(state.mode).toBe('focus')
      expect(state.completedFocusSessions).toBe(session)
    }

    state = timerReducer(state, { type: 'start', now: NOW })
    state = timerReducer(state, {
      type: 'tick',
      now: NOW + 25 * MINUTE_MS,
    })
    state = timerReducer(state, { type: 'skip' })

    expect(state.mode).toBe('longBreak')
    expect(state.remainingMs).toBe(15 * MINUTE_MS)
  })

  it('updates settings and applies them to idle sessions', () => {
    const state = timerReducer(createTimerState(), {
      type: 'updateSettings',
      settings: { focusMinutes: 30, autoStartNext: true },
    })

    expect(state.settings.focusMinutes).toBe(30)
    expect(state.settings.autoStartNext).toBe(true)
    expect(state.remainingMs).toBe(30 * MINUTE_MS)
  })

  it('clamps invalid settings to safe values', () => {
    const state = createTimerState({
      focusMinutes: 0,
      shortBreakMinutes: -5,
      sessionsUntilLongBreak: 99,
    })

    expect(state.settings.focusMinutes).toBe(1)
    expect(state.settings.shortBreakMinutes).toBe(1)
    expect(state.settings.sessionsUntilLongBreak).toBe(12)
  })

  it('ignores start when the session is already completed', () => {
    const completedState = completeFocusSession(NOW)
    const state = timerReducer(completedState, {
      type: 'start',
      now: NOW + 10 * MINUTE_MS,
    })

    expect(state).toBe(completedState)
  })
})
