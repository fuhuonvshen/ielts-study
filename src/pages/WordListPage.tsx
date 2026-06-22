import { useEffect, useState } from 'react'
import { Search, Download } from 'lucide-react'
import { useWordStore } from '@/stores/wordStore'
import { WordList } from '@/components/word/WordList'
import { Pagination } from '@/components/common/Pagination'
import { DataImport } from '@/components/DataImport'

const PAGE_SIZE = 20

export function WordListPage() {
  const { loadWords, setSearchQuery, filteredWords, isLoading, wordListPage, setWordListPage } = useWordStore()
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const allFiltered = filteredWords()
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE)
  const page = Math.min(wordListPage, Math.max(totalPages, 1))
  const pagedWords = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setWordListPage(1)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search words or meanings..."
            onChange={handleSearch}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
          />
        </div>
        <button onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Import
        </button>
      </div>

      <WordList words={pagedWords} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setWordListPage} />

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowImport(false)} />
          <div className="relative w-full max-w-md">
            <DataImport onComplete={() => setShowImport(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
