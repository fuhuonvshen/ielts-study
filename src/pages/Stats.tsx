import { useEffect } from 'react'
import { useStatsStore } from '@/stores/statsStore'
import { useWordStore } from '@/stores/wordStore'
import { Heatmap } from '@/components/stats/Heatmap'
import { TrendChart } from '@/components/stats/TrendChart'

export function Stats() {
  const { last7Days, loadStats } = useStatsStore()
  const { words, loadWords } = useWordStore()
  useEffect(() => { loadStats(); loadWords() }, [loadStats, loadWords])

  const totalPractices = last7Days.reduce((sum, d) => sum + d.totalCount, 0)
  const totalCorrect = last7Days.reduce((sum, d) => sum + d.correctCount, 0)
  const newWords = words.filter((w) => w.status === 'new').length
  const masteredWords = words.filter((w) => w.status === 'mastered').length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[{ label: 'Total Words', value: words.length.toString() },
          { label: 'New', value: newWords.toString() },
          { label: 'Mastered', value: masteredWords.toString() },
          { label: '7-Day Accuracy', value: totalPractices > 0 ? `${Math.round((totalCorrect / totalPractices) * 100)}%` : '0%' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Heatmap data={last7Days} />
        <TrendChart data={last7Days} />
      </div>
    </div>
  )
}
