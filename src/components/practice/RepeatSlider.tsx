import { Repeat } from 'lucide-react'
import { usePracticeStore, type RepeatCount } from '@/stores/practiceStore'

const counts: { value: RepeatCount; label: string }[] = [
  { value: 1, label: 'x1' },
  { value: 5, label: 'x5' },
  { value: 10, label: 'x10' },
]

export function RepeatSlider() {
  const { repeatCount, setRepeatCount } = usePracticeStore()

  return (
    <div className="hidden sm:flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
      <Repeat className="ml-1 h-3.5 w-3.5 text-gray-400" />
      {counts.map((c) => {
        const isActive = repeatCount === c.value
        return (
          <button
            key={c.value}
            onClick={() => setRepeatCount(c.value)}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
