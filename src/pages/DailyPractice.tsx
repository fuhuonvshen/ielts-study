import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { ArticleCard } from '@/components/daily-practice/ArticleCard'
import { ArticleAudioPlayer } from '@/components/daily-practice/ArticleAudioPlayer'
import { BlankInput } from '@/components/daily-practice/BlankInput'
import { ExerciseResult } from '@/components/daily-practice/ExerciseResult'
import type { BlankState } from '@/components/daily-practice/BlankInput'
import type { DailyPracticeData, DailyArticle, BlankItem } from '@/types/dailyPractice'

type PageView = 'list' | 'exercise' | 'result'

const DATA_URL = '/data/daily-practice/data.json'

export function DailyPractice() {
  const [view, setView] = useState<PageView>('list')
  const [data, setData] = useState<DailyPracticeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [blankValues, setBlankValues] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [blankResults, setBlankResults] = useState<{ blankId: number; userAnswer: string; isCorrect: boolean }[] | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const blankRefs = useRef<Map<number, HTMLInputElement>>(new Map())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(DATA_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: DailyPracticeData = await res.json()
      if (!json.articles || json.articles.length === 0) {
        setError('No practice data available yet')
      } else {
        setData(json)
      }
    } catch {
      setError('Failed to load practice data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentArticle: DailyArticle | null = data?.articles[currentIndex] ?? null

  const enterExercise = (index: number) => {
    setCurrentIndex(index)
    setBlankValues({})
    setSubmitted(false)
    setBlankResults(null)
    setShowOriginal(false)
    blankRefs.current.clear()
    setView('exercise')
  }

  const handleBlankChange = (blankId: number, value: string) => {
    setBlankValues((prev) => ({ ...prev, [blankId]: value }))
  }

  const setBlankRef = (blankId: number) => (el: HTMLInputElement | null) => {
    if (el) blankRefs.current.set(blankId, el)
    else blankRefs.current.delete(blankId)
  }

  const focusNextBlank = (currentId: number) => {
    if (!currentArticle) return
    const sortedIds = currentArticle.blanks.map((b) => b.id)
    const idx = sortedIds.indexOf(currentId)
    if (idx >= 0 && idx < sortedIds.length - 1) {
      blankRefs.current.get(sortedIds[idx + 1])?.focus()
    }
  }

  const handleKeyDown = (blankId: number, e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        // shift+tab: focus previous
        if (!currentArticle) return
        const sortedIds = currentArticle.blanks.map((b) => b.id)
        const idx = sortedIds.indexOf(blankId)
        if (idx > 0) blankRefs.current.get(sortedIds[idx - 1])?.focus()
      } else {
        focusNextBlank(blankId)
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!currentArticle || submitted) return
    const results = currentArticle.blanks.map((b) => {
      const userAnswer = (blankValues[b.id] ?? '').trim().toLowerCase()
      const isCorrect = userAnswer === b.answer.toLowerCase()
      return { blankId: b.id, userAnswer, isCorrect }
    })
    setBlankResults(results)
    setSubmitted(true)
    setShowOriginal(true)
  }

  const getBlankState = (blankId: number): BlankState => {
    if (!submitted) {
      return blankValues[blankId]?.trim() ? 'filled' : 'empty'
    }
    const r = blankResults?.find((r) => r.blankId === blankId)
    if (!r) return 'empty'
    return r.isCorrect ? 'correct' : 'incorrect'
  }

  const handleNextArticle = () => {
    if (!data) return
    if (currentIndex + 1 < data.articles.length) {
      enterExercise(currentIndex + 1)
    } else {
      setView('list')
    }
  }

  const renderParagraph = (paragraph: { en: string; cn: string }, pIdx: number) => {
    const parts = paragraph.en.split(/(\{\{\d+\}\})/g)
    return (
      <div key={pIdx} className="mb-4">
        <p className="text-base leading-8 text-gray-800">
          {parts.map((part, i) => {
            const match = part.match(/\{\{(\d+)\}\}/)
            if (match) {
              const blankId = Number(match[1])
              const blank: BlankItem | undefined = currentArticle?.blanks.find((b) => b.id === blankId)
              return (
                <BlankInput
                  key={`${pIdx}-${i}`}
                  blankId={blankId}
                  value={blankValues[blankId] ?? ''}
                  width={blank ? blank.answer.length * 12 + 8 : 80}
                  onChange={(v) => handleBlankChange(blankId, v)}
                  onKeyDown={(e) => handleKeyDown(blankId, e)}
                  disabled={submitted}
                  state={getBlankState(blankId)}
                  correctAnswer={submitted ? blank?.answer : undefined}
                  onRef={setBlankRef(blankId)}
                />
              )
            }
            return <span key={`${pIdx}-${i}`}>{part}</span>
          })}
        </p>
        <button
          onClick={() => setShowOriginal((prev) => !prev)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showOriginal ? <EyeOff className="inline h-3 w-3 mr-1" /> : <Eye className="inline h-3 w-3 mr-1" />}
          {showOriginal ? 'Hide' : 'Show'} Chinese translation
        </button>
        {showOriginal && (
          <p className="mt-1 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{paragraph.cn}</p>
        )}
      </div>
    )
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  // ---- Error / Empty ----
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">{error}</p>
        <button onClick={fetchData} className="mt-4 rounded-xl bg-primary-500 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-600">
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return <div className="py-20 text-center"><p className="text-gray-400">No practice data available</p></div>
  }

  // ---- Exercise view ----
  if (view === 'exercise' && currentArticle) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-sm text-gray-300">
            Article {currentIndex + 1} of {data.articles.length}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：音频 + 原文开关 */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <ArticleAudioPlayer audioFile={currentArticle.audioFile} title={currentArticle.title} />
            {submitted && (
              <button
                onClick={() => setShowOriginal((prev) => !prev)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showOriginal ? 'Hide' : 'View'} original text
              </button>
            )}
          </div>

          {/* 右侧：文章内容 */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">{currentArticle.category}</span>
              <span className="ml-2 text-xs text-gray-400">{currentArticle.source}</span>
              <h2 className="mt-2 text-xl font-bold text-gray-900">{currentArticle.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{currentArticle.titleCn}</p>
            </div>

            {currentArticle.paragraphs.map((p, i) => renderParagraph(p, i))}

            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="mt-4 w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white hover:bg-primary-600"
              >
                Check Answers
              </button>
            ) : (
              blankResults && (
                <div className="mt-6">
                  <ExerciseResult
                    blanks={currentArticle.blanks}
                    results={blankResults}
                    isLastArticle={currentIndex + 1 >= data.articles.length}
                    onNext={handleNextArticle}
                    onBackToList={() => setView('list')}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---- List view ----
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">{data.date}</span>
          <span className="ml-2 text-sm text-gray-500">{data.articles.length} articles today</span>
        </div>
        <button
          onClick={fetchData}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {data.articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} onClick={() => enterExercise(i)} />
        ))}
      </div>
    </div>
  )
}
