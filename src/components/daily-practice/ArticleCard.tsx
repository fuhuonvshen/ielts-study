import type { DailyArticle } from '@/types/dailyPractice'

const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  education: { bg: 'bg-blue-50', text: 'text-blue-600', label: '教育' },
  sports: { bg: 'bg-green-50', text: 'text-green-600', label: '体育' },
  society: { bg: 'bg-amber-50', text: 'text-amber-600', label: '社会' },
  technology: { bg: 'bg-purple-50', text: 'text-purple-600', label: '科技' },
  military: { bg: 'bg-red-50', text: 'text-red-600', label: '军事' },
}

interface Props {
  article: DailyArticle
  onClick: () => void
}

export function ArticleCard({ article, onClick }: Props) {
  const cfg = categoryConfig[article.category] ?? categoryConfig.education

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        <span className="text-xs text-gray-400">{article.source}</span>
        <span className="text-xs text-gray-300">{article.wordCount} words</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 leading-snug">{article.title}</h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.summary}</p>
    </button>
  )
}
