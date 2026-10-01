export interface DailySessionCount {
  date: string
  count: number
}

export function getLocalDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function countSessionsByDay(
  timestamps: number[],
): Record<string, number> {
  return timestamps.reduce<Record<string, number>>((counts, timestamp) => {
    const date = getLocalDateKey(timestamp)
    counts[date] = (counts[date] ?? 0) + 1

    return counts
  }, {})
}

export function getRecentDailyCounts(
  timestamps: number[],
  days: number,
  now: number = Date.now(),
): DailySessionCount[] {
  const counts = countSessionsByDay(timestamps)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const result: DailySessionCount[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(startOfToday)
    date.setDate(date.getDate() - offset)

    const key = getLocalDateKey(date.getTime())
    result.push({
      date: key,
      count: counts[key] ?? 0,
    })
  }

  return result
}
