import type { DailyStats } from '@/types'

interface HeatmapProps { data: DailyStats[] }

export function Heatmap({ data }: HeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.totalCount), 1)
  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100'
    const ratio = count / maxCount
    if (ratio < 0.25) return 'bg-primary-100'
    if (ratio < 0.5) return 'bg-primary-200'
    if (ratio < 0.75) return 'bg-primary-300'
    return 'bg-primary-500'
  }
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Last 7 Days</h3>
      <div className="flex gap-2">
        {data.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={`h-10 w-full rounded-lg ${getIntensity(day.totalCount)} transition-colors`}
              title={`${day.totalCount} practices on ${day.date}`} />
            <span className="text-xs text-gray-400">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
