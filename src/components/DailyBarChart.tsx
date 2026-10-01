import type { DailySessionCount } from '../domain/stats'

interface DailyBarChartProps {
  data: DailySessionCount[]
}

const WIDTH = 720
const HEIGHT = 260
const PADDING = {
  top: 28,
  right: 16,
  bottom: 40,
  left: 36,
}

function DailyBarChart({ data }: DailyBarChartProps) {
  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const maxCount = Math.max(1, ...data.map((day) => day.count))
  const step = chartWidth / data.length

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label="最近 7 天完成番茄数柱状图"
    >
      {[0, 0.5, 1].map((ratio) => {
        const y = PADDING.top + chartHeight - chartHeight * ratio

        return (
          <line
            key={ratio}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={y}
            y2={y}
            stroke="#cbd5e1"
            strokeDasharray="4 6"
          />
        )
      })}

      {data.map((day, index) => {
        const rawHeight = (day.count / maxCount) * chartHeight
        const barHeight = day.count === 0 ? 2 : Math.max(8, rawHeight)
        const x =
          PADDING.left + index * step + (step - Math.min(42, step * 0.62)) / 2
        const barWidth = Math.min(42, step * 0.62)
        const y = PADDING.top + chartHeight - barHeight
        const isToday = index === data.length - 1

        return (
          <g key={day.date}>
            {day.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="#64748b"
              >
                {day.count}
              </text>
            )}

            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill={isToday ? '#e11d48' : '#fb7185'}
            />

            <text
              x={x + barWidth / 2}
              y={HEIGHT - 14}
              textAnchor="middle"
              fontSize="13"
              fill="#64748b"
            >
              {day.date.slice(5)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default DailyBarChart
