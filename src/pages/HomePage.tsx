import { useEffect, useState } from 'react'

import { formatTime, getModeLabel } from '../lib/timerFormat'
import { prepareAudio } from '../services/audio'
import { requestNotificationPermission } from '../services/notifications'
import { useTimerStore } from '../stores/useTimerStore'

function HomePage() {
  const timer = useTimerStore((state) => state.timer)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const skip = useTimerStore((state) => state.skip)
  const getRemainingMs = useTimerStore((state) => state.getRemainingMs)
  const [now, setNow] = useState(() => Date.now())

  const remainingMs = getRemainingMs(now)
  const isRunning = timer.status === 'running'
  const isCompleted = timer.status === 'completed'
  const announcement =
    timer.status === 'completed' ? `${getModeLabel(timer.mode)}完成` : ''

  // 计时开始的瞬间把显示时钟对齐到当前时刻，避免用陈旧时间计算剩余时长
  useEffect(() => {
    return useTimerStore.subscribe((state, previousState) => {
      if (
        state.timer.status === 'running' &&
        previousState.timer.status !== 'running'
      ) {
        setNow(Date.now())
      }
    })
  }, [])

  // 仅在计时运行时刷新时钟；暂停/空闲时剩余时间不会变化，避免无意义的重渲染
  useEffect(() => {
    if (timer.status !== 'running') {
      return
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [timer.status])

  const handlePrimaryAction = () => {
    if (isRunning) {
      pause(Date.now())
      return
    }

    if (isCompleted) {
      void requestNotificationPermission()
      void prepareAudio()
      skip()
      start(Date.now())
      return
    }

    void requestNotificationPermission()
    void prepareAudio()
    start(Date.now())
  }

  const primaryLabel = isRunning
    ? '暂停'
    : isCompleted
      ? '开始下一阶段'
      : timer.status === 'paused'
        ? '继续'
        : '开始'

  return (
    <section className="text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {getModeLabel(timer.mode)}
      </p>

      <p
        className="mt-8 font-mono text-7xl font-semibold tabular-nums text-slate-900 dark:text-slate-50"
        role="timer"
        aria-label={`剩余时间 ${formatTime(remainingMs)}`}
      >
        {formatTime(remainingMs)}
      </p>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        累计完成 {timer.completedFocusSessions} 个番茄
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="rounded-full bg-rose-600 px-8 py-3 font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          onClick={handlePrimaryAction}
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={reset}
        >
          重置
        </button>

        <button
          type="button"
          className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={skip}
        >
          跳过
        </button>
      </div>
    </section>
  )
}

export default HomePage
