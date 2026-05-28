import { WordCard } from './WordCard'
import type { Word } from '@/types'

interface WordListProps {
  words: Word[]
  isLoading: boolean
}

export function WordList({ words, isLoading }: WordListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">No words found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {words.map((word) => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  )
}
