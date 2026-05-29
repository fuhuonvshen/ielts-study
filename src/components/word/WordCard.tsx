import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, Sparkles } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { getAiAnalysis } from '@/lib/db'
import { AiAnalysisSection } from '@/components/ai/AiAnalysisSection'
import type { Word } from '@/types'

interface WordCardProps {
  word: Word
}

export function WordCard({ word }: WordCardProps) {
  const navigate = useNavigate()
  const { play, isPlaying } = useAudio()
  const [showAI, setShowAI] = useState(false)
  const [hasCache, setHasCache] = useState(false)

  useEffect(() => {
    // Check if any persona has cached analysis for this word
    getAiAnalysis(word.id, 'academic').then((r) => setHasCache(!!r))
  }, [word.id])

  return (
    <div>
      <div
        onClick={() => navigate(`/words/${word.id}`)}
        className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:shadow-md hover:shadow-gray-100"
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            play(word.headWord)
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
        >
          <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-primary-500' : ''}`} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold">{word.headWord}</span>
            {word.translations[0]?.pos && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">{word.translations[0].pos}</span>
            )}
            <span className="text-xs text-gray-400">{word.usphone}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {word.translations.map((t, i) => (
              <span key={i}>
                {i > 0 && '；'}
                {t.pos && <span className="text-xs text-gray-400">[{t.pos}] </span>}
                {t.tranCn}
              </span>
            ))}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {word.status === 'mastered' && (
            <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">
              Mastered
            </span>
          )}
          {word.isFavorite && (
            <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600">
              Star
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAI(!showAI)
            }}
            title="AI Analysis"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              hasCache
                ? 'bg-primary-50 text-primary-500 hover:bg-primary-100'
                : 'bg-gray-50 text-gray-300 hover:bg-primary-50 hover:text-primary-400'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {showAI && (
        <div className="-mt-1 rounded-b-2xl border border-t-0 border-gray-100 bg-white px-4 pb-4 pt-3">
          <AiAnalysisSection word={word} />
        </div>
      )}
    </div>
  )
}
