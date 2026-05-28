import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { formatAccuracy } from '@/lib/utils'
import type { Word } from '@/types'

interface SessionResultProps {
  words: Word[]
  answers: { wordId: string; isCorrect: boolean }[]
}

export function SessionResult({ words, answers }: SessionResultProps) {
  const navigate = useNavigate()
  const correctCount = answers.filter((a) => a.isCorrect).length
  const totalCount = answers.length

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-50">
          <TrendingUp className="h-10 w-10 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold">Practice Complete!</h2>
        <p className="mt-1 text-gray-500">
          You got {correctCount} out of {totalCount} correct
        </p>
        <p className="mt-2 text-4xl font-bold text-primary-600">
          {formatAccuracy(correctCount, totalCount)}
        </p>
      </div>

      <div className="space-y-2">
        {answers.map((a, i) => {
          const word = words[i]
          return (
            <div
              key={a.wordId}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
            >
              {a.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-success-500" />
              ) : (
                <XCircle className="h-5 w-5 text-danger-500" />
              )}
              <div>
                <span className="font-medium">{word?.headWord ?? a.wordId}</span>
                <span className="ml-2 text-sm text-gray-400">
                  {word?.translations.map((t) => t.tranCn).join('；')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(0)}
          className="flex-1 rounded-2xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Practice Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
