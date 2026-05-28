import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getWrongWordIds, getWordById } from '@/lib/db'
import { WordCard } from '@/components/word/WordCard'
import { Pagination } from '@/components/common/Pagination'
import type { Word } from '@/types'

const PAGE_SIZE = 20

export function WrongBook() {
  const navigate = useNavigate()
  const [wrongWords, setWrongWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadWrongWords()
  }, [])

  const loadWrongWords = async () => {
    setIsLoading(true)
    const ids = await getWrongWordIds()
    const words = await Promise.all(ids.map((id) => getWordById(id)))
    setWrongWords(words.filter((w): w is Word => w != null))
    setIsLoading(false)
  }

  const totalPages = Math.ceil(wrongWords.length / PAGE_SIZE)
  const pagedWords = wrongWords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {wrongWords.length} word{wrongWords.length !== 1 ? 's' : ''} to review
        </p>
        {wrongWords.length > 0 && (
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <Play className="h-4 w-4" /> Practice These
          </button>
        )}
      </div>

      {wrongWords.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-gray-500">No wrong words yet. Keep practicing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagedWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
