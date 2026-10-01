import type { TimerMode } from '../domain/timer'

const modeLabels: Record<TimerMode, string> = {
  focus: '专注',
  shortBreak: '短休息',
  longBreak: '长休息',
}

export function getModeLabel(mode: TimerMode): string {
  return modeLabels[mode]
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const paddedMinutes = String(minutes).padStart(2, '0')
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  const paddedMinutes = String(minutes).padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}
