import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { WordCard } from '@/components/word/WordCard'
import type { Word } from '@/types'

export function Favorites() {
  const [favorites, setFavorites] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFavorites = async () => {
    setIsLoading(true)
    const words = await db.words.filter((w) => w.isFavorite).toArray()
    setFavorites(words)
    setIsLoading(false)
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {favorites.length} favorite word{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl mb-3">⭐</p>
          <p className="text-gray-500">No favorites yet. Star words while browsing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
