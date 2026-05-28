import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useWordStore } from '@/stores/wordStore'
import { WordList } from '@/components/word/WordList'
import { Pagination } from '@/components/common/Pagination'

const PAGE_SIZE = 20

export function WordListPage() {
  const { loadWords, setSearchQuery, filteredWords, isLoading } = useWordStore()
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const allFiltered = filteredWords()
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE)
  const pagedWords = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search words or meanings..."
          onChange={handleSearch}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
        />
      </div>
      <WordList words={pagedWords} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
