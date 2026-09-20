import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react'
import { ArticleCard } from '@/components/daily-practice/ArticleCard'
import { fetchArchiveIndex, fetchDay } from '@/services/dailyPracticeService'
import type { DailyPracticeData } from '@/types/dailyPractice'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function readable(date: string): string {
  const [y, m, d] = date.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}

export function Archive() {
  const navigate = useNavigate()
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [day, setDay] = useState<DailyPracticeData | null>(null)
  const [dayLoading, setDayLoading] = useState(false)

  useEffect(() => {
    fetchArchiveIndex()
      .then((ds) => {
        setDates(ds)
        setSelected(ds[ds.length - 1] ?? null)
        const latest = ds[ds.length - 1]
        if (latest) {
          const [y, m] = latest.split('-').map(Number)
          setCursor({ year: y, month: m - 1 })
        }
      })
      .catch(() => setError('Failed to load the archive'))
      .finally(() => setLoading(false))
  }, [])

  // Lazy: picking a date fetches that one day, nothing else.
  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setDayLoading(true)
    fetchDay(selected)
      .then((d) => { if (!cancelled) setDay(d) })
      .catch(() => { if (!cancelled) setDay(null) })
      .finally(() => { if (!cancelled) setDayLoading(false) })
    return () => { cancelled = true }
  }, [selected])

  const available = useMemo(() => new Set(dates), [dates])

  const cells = useMemo(() => {
    const offset = new Date(cursor.year, cursor.month, 1).getDay()
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const out: (string | null)[] = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) out.push(toKey(cursor.year, cursor.month, d))
    return out
  }, [cursor])

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const m = c.month + delta
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
      </div>
    )
  }

  if (error) {
    return <p className="py-20 text-center text-sm text-gray-400">{error}</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">
              {cursor.year} 年 {cursor.month + 1} 月
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="上个月"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="下个月"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[22rem]">
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="pb-1 text-xs text-gray-300">{w}</div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={`blank-${i}`} />
              const has = available.has(date)
              const isSelected = date === selected
              return (
                <button
                  key={date}
                  disabled={!has}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded-xl text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-500 font-semibold text-white'
                      : has
                        ? 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                        : 'text-gray-300'
                  }`}
                >
                  {Number(date.slice(-2))}
                </button>
              )
            })}
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          已收录 {dates.length} 天
          {dates.length > 0 && ` · ${dates[0]} 起`}
        </p>
      </section>

      {selected && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">{readable(selected)}</p>
              {day && <p className="text-xs text-gray-400">{day.articles.length} articles</p>}
            </div>
            <button
              onClick={() => navigate(`/daily-practice?date=${selected}`)}
              className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Play className="h-3.5 w-3.5" />
              开始练习
            </button>
          </div>

          {dayLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : day ? (
            <div className="space-y-3">
              {day.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => navigate(`/daily-practice?date=${selected}`)}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">Failed to load this day</p>
          )}
        </section>
      )}
    </div>
  )
}
