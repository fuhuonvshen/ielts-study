import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  const visiblePages = () => {
    if (totalPages <= 7) return pages
    if (page <= 4) return [...pages.slice(0, 5), -1, totalPages]
    if (page >= totalPages - 3) return [1, -1, ...pages.slice(totalPages - 5)]
    return [1, -1, page - 1, page, page + 1, -1, totalPages]
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {visiblePages().map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="px-1 text-gray-300">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
