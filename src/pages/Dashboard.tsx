import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, TrendingUp, Target } from 'lucide-react'
import { useStatsStore } from '@/stores/statsStore'
import { useWordStore } from '@/stores/wordStore'
import { Heatmap } from '@/components/stats/Heatmap'
import { TrendChart } from '@/components/stats/TrendChart'
import { formatAccuracy } from '@/lib/utils'
import { DataImport } from '@/components/DataImport'

export function Dashboard() {
  const navigate = useNavigate()
  const { todayTotal, todayCorrect, streak, last7Days, loadStats } = useStatsStore()
  const { words, loadWords } = useWordStore()

  useEffect(() => { loadStats(); loadWords() }, [loadStats, loadWords])

  if (words.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <DataImport />
      </div>
    )
  }

  const stats = [
    { label: 'Today', value: todayTotal.toString(), icon: Target, color: 'text-primary-500 bg-primary-50' },
    { label: 'Accuracy', value: formatAccuracy(todayCorrect, todayTotal), icon: TrendingUp, color: 'text-success-500 bg-success-50' },
    { label: 'Streak', value: `${streak}d`, icon: Play, color: 'text-orange-500 bg-orange-50' },
    { label: 'Words', value: words.length.toString(), icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Heatmap data={last7Days} />
        <TrendChart data={last7Days} />
      </div>
      <div className="flex gap-4">
        <button onClick={() => navigate('/practice')} className="flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
          <Play className="h-4 w-4" /> Start Practice
        </button>
        <button onClick={() => navigate('/words')} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
          <BookOpen className="h-4 w-4" /> Browse Words
        </button>
      </div>
    </div>
  )
}
