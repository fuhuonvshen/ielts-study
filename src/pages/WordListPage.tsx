import { useEffect } from 'react'
import { Search } from 'lucide-react'
import { useWordStore } from '@/stores/wordStore'
import { WordList } from '@/components/word/WordList'

export function WordListPage() {
  const { loadWords, setSearchQuery, filteredWords, isLoading } = useWordStore()

  useEffect(() => {
    loadWords()
  }, [loadWords])

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search words or meanings..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
        />
      </div>
      <WordList words={filteredWords()} isLoading={isLoading} />
    </div>
  )
}
