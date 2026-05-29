import { useState } from 'react'
import { Mic, Loader2, X } from 'lucide-react'
import { analyzePronunciation } from '@/services/aiService'

interface AiPronunciationProps {
  word: string
}

export function AiPronunciation({ word }: AiPronunciationProps) {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const text = await analyzePronunciation(word)
      setResult(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="relative">
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        title="AI Pronunciation Coach"
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          isLoading
            ? 'bg-primary-100 text-primary-400'
            : 'bg-primary-50 text-primary-600 hover:bg-primary-100 active:scale-95'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
        AI Pronunciation
      </button>

      {(result || error) && (
        <div className="absolute left-1/2 top-full mt-2 z-40 w-72 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl animate-fade-in">
          <button
            onClick={handleClose}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-gray-50 hover:text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-primary-500" />
                <span className="text-xs font-semibold text-gray-500">Pronunciation Coach</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{result}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
