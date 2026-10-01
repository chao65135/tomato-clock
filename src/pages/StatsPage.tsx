import { useMemo } from 'react'

import DailyBarChart from '../components/DailyBarChart'
import { getRecentDailyCounts } from '../domain/stats'
import { useTimerStore } from '../stores/useTimerStore'

function StatsPage() {
  const completedSessions = useTimerStore(
    (state) => state.timer.completedSessions,
  )
  const settings = useTimerStore((state) => state.timer.settings)
  const dailyCounts = useMemo(
    () => getRecentDailyCounts(completedSessions, 7),
    [completedSessions],
  )

  const todayCount = dailyCounts.at(-1)?.count ?? 0
  const weekCount = dailyCounts.reduce((total, day) => total + day.count, 0)

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      settings,
      completedSessions,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tomato-clock-sessions.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">统计</h1>

        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={handleExport}
        >
          导出数据
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">今日</p>
          <p className="mt-2 text-3xl font-semibold">{todayCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">近 7 天</p>
          <p className="mt-2 text-3xl font-semibold">{weekCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">累计</p>
          <p className="mt-2 text-3xl font-semibold">
            {completedSessions.length}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          最近 7 天
        </h2>

        {completedSessions.length === 0 ? (
          <p className="mt-6 text-slate-500 dark:text-slate-400">
            还没有完成记录，先完成一个番茄吧。
          </p>
        ) : (
          <DailyBarChart data={dailyCounts} />
        )}
      </div>
    </section>
  )
}

export default StatsPage
