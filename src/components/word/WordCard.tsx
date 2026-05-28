import { useNavigate } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import type { Word } from '@/types'

interface WordCardProps {
  word: Word
}

export function WordCard({ word }: WordCardProps) {
  const navigate = useNavigate()
  const { play, isPlaying } = useAudio()

  return (
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
          <span className="text-xs text-gray-400">{word.usphone}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {word.translations.map((t) => t.tranCn).join('；')}
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
      </div>
    </div>
  )
}
