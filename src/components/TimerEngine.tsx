import { useEffect, useRef } from 'react'

import { playCompletionSound } from '../services/audio'
import { notifyTimerCompleted } from '../services/notifications'
import { useTimerStore } from '../stores/useTimerStore'

function TimerEngine() {
  const timer = useTimerStore((state) => state.timer)
  const tick = useTimerStore((state) => state.tick)
  const skip = useTimerStore((state) => state.skip)
  const start = useTimerStore((state) => state.start)
  const previousStatus = useRef(timer.status)

  useEffect(() => {
    tick()

    const intervalId = window.setInterval(() => {
      tick(Date.now())
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [tick])

  useEffect(() => {
    const wasRunning = previousStatus.current === 'running'

    if (timer.status === 'completed' && wasRunning) {
      notifyTimerCompleted(timer.mode)
      playCompletionSound()
    }

    previousStatus.current = timer.status

    if (
      timer.status === 'completed' &&
      wasRunning &&
      timer.settings.autoStartNext
    ) {
      const timeoutId = window.setTimeout(() => {
        skip()
        start(Date.now())
      }, 1500)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [skip, start, timer.mode, timer.settings.autoStartNext, timer.status])

  return null
}

export default TimerEngine
