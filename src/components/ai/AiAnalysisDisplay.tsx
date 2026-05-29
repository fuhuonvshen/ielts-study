import type { AiAnalysisContent } from '@/types'

const sections: { key: keyof AiAnalysisContent; icon: string; title: string }[] = [
  { key: 'memoryTip', icon: '🧠', title: 'Memory Tip' },
  { key: 'synonymDifferentiation', icon: '🔍', title: 'Synonym Differentiation' },
  { key: 'usageNote', icon: '💡', title: 'Usage Note' },
  { key: 'interestingFact', icon: '⚡', title: 'Fun Fact' },
]

interface AiAnalysisDisplayProps {
  content: AiAnalysisContent
}

export function AiAnalysisDisplay({ content }: AiAnalysisDisplayProps) {
  return (
    <div className="space-y-3">
      {sections.map(({ key, icon, title }) => {
        const text = content[key]
        if (!text) return null
        return (
          <div key={key} className="rounded-xl bg-gray-50 p-3.5">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span className="text-sm">{icon}</span>
              {title}
            </h4>
            <p className="text-sm leading-relaxed text-gray-700">{text}</p>
          </div>
        )
      })}
    </div>
  )
}
