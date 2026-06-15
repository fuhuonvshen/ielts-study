import { CheckCircle, XCircle } from 'lucide-react'
import { formatAccuracy } from '@/lib/utils'
import type { BlankItem } from '@/types/dailyPractice'

interface BlankResult {
  blankId: number
  userAnswer: string
  isCorrect: boolean
}

interface Props {
  blanks: BlankItem[]
  results: BlankResult[]
  isLastArticle: boolean
  onNext: () => void
  onBackToList: () => void
}

export function ExerciseResult({ blanks, results, isLastArticle, onNext, onBackToList }: Props) {
  const correctCount = results.filter((r) => r.isCorrect).length
  const totalCount = results.length

  const blankMap = new Map(blanks.map((b) => [b.id, b]))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-50">
          <span className="text-3xl font-bold text-primary-500">
            {formatAccuracy(correctCount, totalCount)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Exercise Complete</h2>
        <p className="mt-1 text-gray-500">
          {correctCount} of {totalCount} blanks correct
        </p>
      </div>

      {/* Grid: left-to-right, top-to-bottom */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {results.map((r) => {
          const blank = blankMap.get(r.blankId)
          if (!blank) return null
          return (
            <div key={r.blankId}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-sm ${
                r.isCorrect ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
              }`}
            >
              {r.isCorrect
                ? <CheckCircle className="h-4 w-4 shrink-0 text-success-500" />
                : <XCircle className="h-4 w-4 shrink-0 text-danger-500" />
              }
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {r.isCorrect ? (
                    <span className="font-medium text-gray-900">{blank.answer}</span>
                  ) : (
                    <>
                      <span className="text-danger-600 line-through text-xs">{r.userAnswer || '(empty)'}</span>
                      <span className="font-medium text-success-600">{blank.answer}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{blank.hint}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          {isLastArticle ? 'Finish' : 'Next Article'}
        </button>
        <button
          onClick={onBackToList}
          className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to List
        </button>
      </div>
    </div>
  )
}
